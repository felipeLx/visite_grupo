import { type SerializeFrom } from '@remix-run/node'
import { useRouteLoaderData } from '@remix-run/react'
import { type loader as rootLoader } from '~/root'

/**
 * @returns the request info from the root loader
 */
export function useRequestInfo() {
	const data = useRouteLoaderData('root') as SerializeFrom<typeof rootLoader>
	console.log('info from the root loader', data)
	return data?.requestInfo
}
