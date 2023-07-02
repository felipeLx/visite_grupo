import { json, type DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { NoteEditor } from '~/routes/resources+/note-editor'
import { requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'

export async function loader({ params, request }: DataFunctionArgs) {
	const userId = await requireUserId(request)
	const note = await prisma.note.findFirst({
		where: {
			id: params.noteId,
			ownerId: userId,
		},
	})
	if (!note) {
		throw new Response('Not found', { status: 404 })
	}
	return json({ note: note })
}

export default function ServiceEdit() {
	const data = useLoaderData<typeof loader>()

	return <NoteEditor note={data.note} />
}
