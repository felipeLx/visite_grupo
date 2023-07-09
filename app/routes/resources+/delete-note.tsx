import { json, type DataFunctionArgs, redirect } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { Button, ErrorList } from '~/utils/forms'
import { useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'
import { prisma } from '~/utils/db.server'
import { getUser } from '~/utils/session.server'
import { deleteNote } from '~/models/note.server'

const DeleteFormSchema = z.object({
	noteId: z.string(),
})

export async function action({ request }: DataFunctionArgs) {
	const user = await getUser(request)
	const formData = await request.formData()
	const submission = parse(formData, {
		schema: DeleteFormSchema,
		acceptMultipleErrors: () => true,
	})
	if (!submission.value || submission.intent !== 'submit') {
		return json(
			{
				status: 'error',
				submission,
			} as const,
			{ status: 400 },
		)
	}

	const { noteId } = submission.value

	const note = await prisma.note.findFirst({
		select: { id: true, owner: { select: { username: true } } },
		where: {
			id: noteId,
			ownerId: user?.id,
		},
	})

	console.log('note', note)
	if (!note) {
		submission.error.noteId = ['Note not found']
		return json({ status: 'error', submission } as const, {
			status: 404,
		})
	}

	await deleteNote({id: note.id, ownerId: user?.id || ''})
	return redirect(`/users/${note.owner.username}/services`)
}

export function DeleteNote({ id }: { id: string }) {
	const noteDeleteFetcher = useFetcher<typeof action>()

	const [form] = useForm({
		id: 'delete-note',
		constraint: getFieldsetConstraint(DeleteFormSchema),
		onValidate({ formData }) {
			return parse(formData, { schema: DeleteFormSchema })
		},
	})

	return (
		<noteDeleteFetcher.Form
			method="POST"
			action="/resources/delete-note"
			{...form.props}
		>
			<input type="hidden" name="noteId" value={id} />
			<Button
				type="submit"
				size="sm"
				variant="secondary"
				status={
					noteDeleteFetcher.state === 'submitting'
						? 'pending'
						: noteDeleteFetcher.data?.status ?? 'idle'
				}
				disabled={noteDeleteFetcher.state !== 'idle'}
			>
				Apagar
			</Button>
			<ErrorList errors={form.errors} id={form.errorId} />
		</noteDeleteFetcher.Form>
	)
}
