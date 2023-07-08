import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import {
	type DataFunctionArgs,
	json,
	redirect,
	unstable_createMemoryUploadHandler,
	unstable_parseMultipartFormData,
} from '@remix-run/node'
import {
	Form,
	Link,
	useFetcher,
	useLoaderData,
	useNavigate,
} from '@remix-run/react'
import { useState } from 'react'
import { z } from 'zod'
import { Button } from '~/utils/forms'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from '~/components/ui/dialog'
import * as deleteImageRoute from '~/routes/resources+/delete-image'
//import { authenticator, requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { ErrorList } from '~/components/forms'
import { getServiceImgSrc } from '~/utils/misc'
import { Icon } from '~/components/ui/icon'
//import { getUserId } from '~/utils/session.server'
import { getUserByUsername } from '~/models/user.server'
import { getNote } from '~/models/note.server'

const MAX_SIZE = 1024 * 1024 * 3 // 3MB

/*
The preprocess call is needed because a current bug in @remix-run/web-fetch
for more info see the bug (https://github.com/remix-run/web-std-io/pull/28)
and the explanation here: https://conform.guide/file-upload
*/
const PhotoFormSchema = z.object({
	photoFile: z.preprocess(
		value => (value === '' ? new File([], '') : value),
		z
			.instanceof(File)
			.refine(file => file.name !== '' && file.size !== 0, 'Precisa de uma imagem')
			.refine(file => {
				return file.size <= MAX_SIZE
			}, 'Imagem tem que ser menor que 3MB'),
	),
})

export async function loader({ params, request }: DataFunctionArgs) {
  let username: string = params.username ?? '';
  let idParams = params.serviceId || '';
  
  const owner = await getUserByUsername(username);

  if (!owner) {
    throw new Response("Você deve fazer login antes de Cadastrar um serviço.", { status: 404 });
  }

	const note = await getNote({id: idParams, ownerId: owner.id })
	if (!note) {
		return redirect("/")
	}
	return json({ note })
}

export async function action({ params, request }: DataFunctionArgs) {
	let username: string = params.username ?? '';
  let idParams = params.serviceId || '';
  
  const owner = await getUserByUsername(username);
  if(!owner) {
    return {error: "Algo estranho ocorreu, por favor reiniciar a página"}
  }

  const formData = await unstable_parseMultipartFormData(
		request,
		unstable_createMemoryUploadHandler({ maxPartSize: MAX_SIZE }),
	)

	const submission = parse(formData, { schema: PhotoFormSchema })

	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}
	if (!submission.value) {
		return json(
			{
				status: 'error',
				submission,
			} as const,
			{ status: 400 },
		)
	}

	const { photoFile } = submission.value

	const newPrismaPhoto = {
		contentType: photoFile.type,
		file: {
			create: {
				blob: Buffer.from(await photoFile.arrayBuffer()),
			},
		},
	}

	const previousUserPhoto = await prisma.note.findUnique({
		where: { id: idParams },
		select: { imageId: true },
	})

	await prisma.note.update({
		select: { id: true },
		where: { id: idParams },
		data: {
			image: {
				upsert: {
					update: newPrismaPhoto,
					create: newPrismaPhoto,
				},
			},
		},
	})

	if (previousUserPhoto?.imageId) {
		void prisma.image
			.delete({
				where: { fileId: previousUserPhoto.imageId },
			})
			.catch(() => {}) // ignore the error, maybe it never existed?
	}

	return redirect(`/users/${owner.username}/services/${idParams}`)
}

export default function PhotoChooserModal() {
	const data = useLoaderData<typeof loader>()
	const [newImageSrc, setNewImageSrc] = useState<string | null>(null)
	const navigate = useNavigate()
	const deleteImageFetcher = useFetcher<typeof deleteImageRoute.action>()
	//const actionData = useActionData<typeof action>()
	const [form, { photoFile }] = useForm({
		id: 'service-photo',
		constraint: getFieldsetConstraint(PhotoFormSchema),
		onValidate({ formData }) {
			return parse(formData, { schema: PhotoFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	const deleteProfilePhotoFormId = 'delete-service-photo'
	const dismissModal = () => navigate('..', { preventScrollReset: true })
	return (
		<Dialog open={true}>
			<DialogContent
				onEscapeKeyDown={dismissModal}
				onPointerDownOutside={dismissModal}
				className="fixed left-1/2 top-1/2 w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 transform rounded-lg border-2 bg-background p-12 shadow-lg"
			>
				<DialogTitle asChild className="text-center">
					<h2 className="text-h2">Foto do seu Produto ou Serviço</h2>
				</DialogTitle>
				<Form
					method="POST"
					encType="multipart/form-data"
					className="mt-8 flex flex-col items-center justify-center gap-10"
					onReset={() => setNewImageSrc(null)}
					{...form.props}
				>
					<img
						src={newImageSrc ?? getServiceImgSrc(data.note.imageId)}
						className="h-64 w-64 rounded-full"
						alt={data.note.title}
					/>
					<ErrorList errors={photoFile.errors} id={photoFile.id} />
					<input
						{...conform.input(photoFile, { type: 'file' })}
						type="file"
						accept="image/*"
						className="sr-only"
						tabIndex={newImageSrc ? -1 : 0}
						onChange={e => {
							const file = e.currentTarget.files?.[0]
							if (file) {
								const reader = new FileReader()
								reader.onload = event => {
									setNewImageSrc(event.target?.result?.toString() ?? null)
								}
								reader.readAsDataURL(file)
							}
						}}
					/>
					{newImageSrc ? (
						<div className="flex gap-4">
							<Button size='sm' variant='secondary' type="submit">Salvar Foto</Button>
							<Button size='sm' variant='primary' type="reset">
								Reiniciar
							</Button>
						</div>
					) : (
						<div className="flex gap-4">
							<Button size='sm' variant='secondary' type='reset' className="cursor-pointer">
								<label htmlFor={photoFile.id} className="flex gap-1">
									<Icon name="pencil-1" /> Alterar
								</label>
							</Button>
							{data.note.imageId ? (
								<Button
									type="submit"
									size='sm'
									variant='primary'
									form={deleteProfilePhotoFormId}
									className="flex gap-1"
								>
									<Icon name="trash" /> Apagar
								</Button>
							) : null}
						</div>
					)}
					<ErrorList errors={form.errors} />
				</Form>
				<DialogClose asChild>
					<Link
						to=".."
						preventScrollReset
						aria-label="Close"
						className="absolute right-10 top-10"
					>
						<Icon name="cross-1" />
					</Link>
				</DialogClose>
			</DialogContent>
			<deleteImageFetcher.Form
				method="POST"
				id={deleteProfilePhotoFormId}
				action={deleteImageRoute.ROUTE_PATH}
			>
				<input name="intent" type="hidden" value="submit" />
				<input name="imageId" type="hidden" value={data.note.imageId ?? ''} />
			</deleteImageFetcher.Form>
		</Dialog>
	)
}
