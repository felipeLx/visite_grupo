import { json } from '@remix-run/router'
import { type DataFunctionArgs } from '@remix-run/server-runtime'
import { NoteEditor } from '~/routes/resources+/note-editor'
import { requireUserId } from '~/utils/auth.server'

export async function loader({ request }: DataFunctionArgs) {
	await requireUserId(request)
	return json({})
}

export default function NewServiceRoute() {
	return <NoteEditor />
}
