import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { json, redirect, type DataFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { useState } from 'react'
import { z } from 'zod'
import { prisma } from '~/utils/db.server'
import { Button, ErrorList, Field, TextareaField } from '~/utils/forms'
import { getUser } from '~/utils/session.server'

export const NoteEditorSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	content: z.string().min(1),
	phone: z.string().min(1),
	site: z.string().min(1),
	latitud: z.string().min(1),
	longitud: z.string().min(1),
	delivery: z.string().min(1),
	open: z.string().min(1),
	close: z.string().min(1),
})


export async function action({ request }: DataFunctionArgs) {
	const owner = await getUser(request)
	const formData = await request.formData()
	const submission = parse(formData, {
		schema: NoteEditorSchema,
		acceptMultipleErrors: () => true,
	})
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
	let note: { id: string; owner: { username: string } }

	const { title, content, id, site, phone, open, close, delivery, nodelivery, latitud, longitud } = submission.value

	let doDelivery = delivery === 'on' ? 'Sim' : 'Não';

	const data = {
		ownerId: owner?.id,
		title: title,
		content: content,
		site: site,
		phone: phone,
		open: open,
		close: close,
		delivery: doDelivery,
		latitud: latitud,
		longitud: longitud
	}

	const select = {
		id: true,
		owner: {
			select: {
				username: true,

			},
		},
	}
	if (id) {
		const existingNote = await prisma.note.findFirst({
			where: { id, ownerId: owner?.id },
			select: { id: true },
		})
		if (!existingNote) {
			return json(
				{
					status: 'error',
					submission,
				} as const,
				{ status: 404 },
			)
		}
		note = await prisma.note.update({
			where: { id },
			data,
			select,
		})
	} else {
		note = await prisma.note.create({ data, select })
	}
	return redirect(`/users/${note.owner.username}/services/${note.id}`)
}

export function NoteEditor({
	note,
}: {
	note?: { id: string; title: string; content: string; site: string; phone: string; open: string; close: string; latitud: string; longitud: string; delivery: string; keywords: string;}
}) {
	const noteEditorFetcher = useFetcher<typeof action>()

	const [isIn, setIsIn] = useState(false);
	const handleInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setIsIn(!isIn); setIsOut(false);
	};
	const [isOut, setIsOut] = useState(false);
	
	const handleOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setIsOut(!isOut);
		setIsIn(false);
	};

	const [form, fields] = useForm({
		id: 'note-editor',
		constraint: getFieldsetConstraint(NoteEditorSchema),
		lastSubmission: noteEditorFetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: NoteEditorSchema })
		},
		defaultValue: {
			title: note?.title,
			content: note?.content,
			site: note?.site,
			phone: note?.phone,
			open: note?.open,
			close: note?.close,
			latitud: note?.latitud,
			longitud: note?.longitud,
			delivery: note?.delivery,
			keywords: note?.keywords,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<noteEditorFetcher.Form
			method="POST"
			action="/resources/note-editor"
			{...form.props}
		>
			<input name="id" type="hidden" value={note?.id} />
			<Field
				labelProps={{ htmlFor: fields.title.id, children: 'Título' }}
				inputProps={{
					...conform.input(fields.title),
					autoComplete: 'title',
				}}
				className='text-white text-lg font-bold'
				errors={fields.title.errors}
			/>
			<TextareaField
				labelProps={{ htmlFor: fields.content.id, children: 'Descrição' }}
				textareaProps={{
					...conform.textarea(fields.content),
					autoComplete: 'content',
				}}
				className='text-white'
				errors={fields.content.errors}
			/>
			<div className='flex w-full flex-row'>
				<Field
					labelProps={{ htmlFor: fields.phone.id, children: 'Telefone (só números com Whatsapp, ex: 22999378572)' }}
					inputProps={{
						...conform.input(fields.phone),
						autoComplete: 'phone'
					}}
					className='text-white flex w-full'
					errors={fields.phone.errors}
				/>
				<Field
					labelProps={{ htmlFor: fields.site.id, children: 'Site (ex: https://meusite.com.br ou https://facebook.com/meuUsuario)' }}
					inputProps={{
						...conform.input(fields.site),
						autoComplete: 'site',
					}}
					className='text-white flex w-full'
					errors={fields.site.errors}
				/>
			</div>
			<div className='flex w-full flex-row justify-between space-x-2'>
				<Field
					labelProps={{ htmlFor: fields.open.id, children: 'Aberto às' }}
					inputProps={{
						...conform.input(fields.open),
						autoComplete: 'open',
						type: 'time'
					}}
					className='text-white'
					errors={fields.open.errors}
				/>
				<Field
					labelProps={{ htmlFor: fields.close.id, children: 'Fecha às' }}
					inputProps={{
						...conform.input(fields.close),
						autoComplete: 'close',
						type: 'time'
					}}
					className='text-white'
					errors={fields.close.errors}
				/>
				<div className="flex-none border-[1.5px] h-[4.15rem] border-night-400 bg-night-700 hover:border-brand-primary focus:border-brand-primary active:border-brand-primary-muted text-night-200 text-sm font-light px-2 pt-1 rounded-lg text-center">
					<label className="flex w-full flex-col gap-1">
						<span>Faz Entrega? </span>
						<div className='flex flex-row space-x-2'>
							<div className="block min-h-[0.5rem] pl-[1.5rem]">
							<input
								className="relative float-left -ml-[1.5rem] mr-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] checked:bg-indigo-950 appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none"
								type="checkbox"
								name="delivery"              
								checked={isIn}
								onChange={handleInChange}
								id="checkboxDefault" />
							<label
								className="inline-block pl-[0.15rem] hover:cursor-pointer"
								htmlFor="checkboxDefault">
								Sim
							</label>
							</div>
							<div className="block min-h-[0.5rem] pl-[1.5rem]">
							<input
								className="relative float-left -ml-[1.5rem] mr-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] checked:bg-indigo-950 appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none"
								type="checkbox"
								name="nodelivery"
								checked={isOut}
								onChange={handleOutChange}
								id="checkboxChecked"
								/>
							<label
								className="inline-block pl-[0.15rem] hover:cursor-pointer"
								htmlFor="checkboxChecked">
								Não
							</label>
							</div>
						</div>
					</label>
					</div>
				<Field
					labelProps={{ htmlFor: fields.latitud.id, children: 'ex. -22.8988856' }}
					inputProps={{
						...conform.input(fields.latitud),
						autoComplete: 'latitud',
					}}
					className='text-white flex w-full'
					errors={fields.latitud.errors}
				/>
				<Field
					labelProps={{ htmlFor: fields.longitud.id, children: 'ex. -42.4406357' }}
					inputProps={{
						...conform.input(fields.longitud),
						autoComplete: 'longitud',
					}}
					className='text-white flex w-full'
					errors={fields.longitud.errors}
				/>
			</div>
			<ErrorList errors={form.errors} id={form.errorId} />
			<div className="flex justify-center gap-4">
				<Button size="md" variant="secondary" className='text-white' type="reset">
					Reinicar
				</Button>
				<Button
					size="md"
					variant="primary"
					status={
						noteEditorFetcher.state === 'submitting'
							? 'pending'
							: noteEditorFetcher.data?.status ?? 'idle'
					}
					type="submit"
					disabled={noteEditorFetcher.state !== 'idle'}
				>
					Gravar
				</Button>
			</div>
		</noteEditorFetcher.Form>
	)
}
