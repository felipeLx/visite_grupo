import { json } from '@remix-run/router'
import { type DataFunctionArgs } from '@remix-run/server-runtime'
import { NoteEditor } from '~/routes/resources+/note-editor'
import { getUserId } from '~/utils/session.server'

export async function loader({ request }: DataFunctionArgs) {
	await getUserId(request)
	return json({})
}

export default function NewServiceRoute() {
	return <NoteEditor />
}
