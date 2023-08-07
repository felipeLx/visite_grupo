import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { json, type DataFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { z } from 'zod'
import { prisma } from '~/utils/db.server'
import { ErrorList, Field, TextareaField } from '~/components/forms'
import { redirectWithToast } from '~/utils/flash-session.server'
import { CheckboxField, Button } from '~/utils/forms'
import { getUserId } from '~/utils/session.server'

export const NoteEditorSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(3, 'Coloque um título maior'),
	content: z.string().min(10, 'Faça uma descrição maior.'),
	site: z.string().url('Precisa ser uma url válida: https://'),
	phone: z.string().min(11, 'Coloque o telefone com DDD, ex: 22999378572').max(11).regex(/[0-9]+/),
	latitud: z.string().startsWith('-', 'Latitude para o Brasil começa com -'),
	longitud: z.string().startsWith('-', 'Longitude para o Brasil começa com -'),
	open: z.string().optional(),
	close: z.string().optional(),
	delivery: z.string().optional(),
	keywords: z.string().optional(),
})

export async function action({ request }: DataFunctionArgs) {
	const userId = await getUserId(request) ||''
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

	const { title, content, id, site, phone, latitud, longitud, delivery, open, close, keywords } = submission.value

	if(typeof title !== 'string' || typeof content !== 'string' || typeof site !== 'string' || typeof phone !== 'string' || typeof latitud !== 'string' || typeof longitud !== 'string' || typeof open !== 'string' || typeof close !== 'string' || typeof keywords !== 'string') {
		return json(
			{
				status: 'error',
				submission,
			} as const,
			{ status: 400 },
		)
	}

	let transformedDelivery = delivery === 'on' ? 'Sim' : 'Não';
	let transformedPhone = phone.replace(/[a-zA-Z]/,'')
	let transformedKeywords = keywords.replace(/[^a-zA-Zãõêâôéáíóúç]/,', ')
	console.log(transformedKeywords)
	
	const data = {
		ownerId: userId,
		title: title,
		content: content,
		site: site,
		phone: transformedPhone,
		delivery: transformedDelivery,
		open: open,
		close: close,
		latitud: latitud,
		longitud: longitud,
		keywords: transformedKeywords,
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
			where: { id, ownerId: userId },
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
	return redirectWithToast(`/users/${note.owner.username}/services/${note.id}`, {
		title: id ? 'Note updated' : 'Note created',
	})
}

export function NoteEditor({
	note,
}: {
	note?: { id: string; title: string; content: string, site: string; phone: string; latitud: string, longitud: string; open: string; close: string; keywords: string; }
}) {
	const noteEditorFetcher = useFetcher<typeof action>()

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
			latitud: note?.latitud,
			longitud: note?.longitud,
			open: note?.open,
			close: note?.close,
			keywords: note?.keywords
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<noteEditorFetcher.Form
			method="post"
			action="/resources/note-editor"
			{...form.props}
		>
			<input name="id" type="hidden" value={note?.id} />
			<Field
				labelProps={{ children: 'Título' }}
					inputProps={{
					...conform.input(fields.title),
					autoComplete: 'title',
				}}
				errors={fields.title.errors}
			/>
			<TextareaField
				labelProps={{ children: 'Descrição' }}
				textareaProps={{
					...conform.textarea(fields.content),
					autoComplete: 'content',
				}}
				errors={fields.content.errors}
			/>
			<div className='flex flex-row w-full justify-between'>
				<Field
					labelProps={{ children: 'Telefone, só números (ex. 22999357043)' }}
						inputProps={{
						...conform.input(fields.phone),
						autoComplete: 'phone',
					}}
					className='w-full'
					errors={fields.phone.errors}
				/>
				<Field
					labelProps={{ children: 'Site ou sua rede social com seu trabalho' }}
						inputProps={{
						...conform.input(fields.site),
						autoComplete: 'site',
					}}
					className='w-full ml-2'
					errors={fields.site.errors}
				/>
			</div>
			<div className='flex flex-row w-full justify-between'>
				<Field
					labelProps={{ children: 'Palavras chave: ex. comida, lanche, artesanato, servicos' }}
						inputProps={{
						...conform.input(fields.keywords),
						autoComplete: 'keywords',
					}}
					className='w-full'
					errors={fields.keywords.errors}
				/>
			</div>
			<div className='flex flex-row w-full justify-around'>
				<Field
					labelProps={{ children: 'Latitude (ex. -22.45763)' }}
						inputProps={{
						...conform.input(fields.latitud),
						autoComplete: 'latitud',
						type: "text"
					}}
					className='p-2'
					errors={fields.latitud.errors}
				/>
				<Field
					labelProps={{ children: 'Longitude (ex. -42.42759)' }}
						inputProps={{
						...conform.input(fields.longitud),
						autoComplete: 'longitud',
						type: "text"
					}}
					className='p-2 ml-2'
					errors={fields.longitud.errors}
				/>
				<CheckboxField
					labelProps={{ children: 'Faz Delivery?' }}
					buttonProps={{
						...conform.input(fields.delivery),
					}}
					errors={fields.delivery.errors}
				/>
				<Field
					labelProps={{ children: 'Abre às' }}
						inputProps={{
						...conform.input(fields.open),
						autoComplete: 'open',
						type: "time"
					}}
					className='p-2 ml-2'
					errors={fields.open.errors}
				/>
				<Field
					labelProps={{ children: 'Fecha às' }}
						inputProps={{
						...conform.input(fields.close),
						autoComplete: 'close',
						type: "time"
					}}
					className='p-2 ml-2'
					errors={fields.close.errors}
				/>
			</div>
			<ErrorList errors={form.errors} id={form.errorId} />
			<div className="flex justify-end gap-4">
				<Button type="reset" size='md' variant='primary'>
					Reiniciar
				</Button>
				<Button
					type="submit" size='md' variant='secondary'
					status={
						noteEditorFetcher.state === 'submitting'
							? 'pending'
							: noteEditorFetcher.data?.status ?? 'idle'
					}
					disabled={noteEditorFetcher.state !== 'idle'}
				>
					Gravar
				</Button>
			</div>
		</noteEditorFetcher.Form>
	)
}
