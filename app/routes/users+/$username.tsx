import {
	json,
	type DataFunctionArgs,
	type V2_MetaFunction,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Spacer } from '~/components/spacer'
import { prisma } from '~/utils/db.server'
import { Button, ButtonLink } from '~/utils/forms'
import { getUserImgSrc } from '~/utils/misc'
import { useOptionalUser } from '~/utils/user'

export async function loader({ params }: DataFunctionArgs) {
	invariant(params.username, 'Missing username')
	const user = await prisma.user.findUnique({
		where: { username: params.username },
		select: {
			id: true,
			username: true,
			name: true,
			imageId: true,
			createdAt: true,
		},
	})
	if (!user) {
		throw new Response('not found', { status: 404 })
	}
	return json({ user, userJoinedDisplay: user.createdAt.toLocaleDateString() })
}

export default function UsernameIndex() {
	const data = useLoaderData<typeof loader>()
	const user = data.user
	const userDisplayName = user.name ?? user.username
	const loggedInUser = useOptionalUser()
	const isLoggedInUser = data.user.id === loggedInUser?.id
	console.log('isLoggedInUser', isLoggedInUser)
	return (
		<div className="container mx-auto mb-48 mt-36 flex flex-col items-center justify-center">
			<Spacer size="4xs" />

			<div className="container mx-auto flex flex-col items-center rounded-3xl bg-night-500 p-12">
				<div className="relative w-52">
					<div className="absolute -top-40">
						<div className="relative">
							<img
								src={getUserImgSrc(data.user.imageId)}
								alt={userDisplayName}
								className="h-52 w-52 rounded-full object-cover"
							/>
						</div>
					</div>
				</div>

				<Spacer size="sm" />

				<div className="flex flex-col items-center text-white">
					<div className="flex flex-wrap items-center justify-center gap-4">
						<h1 className="text-center text-h2 text-white">{userDisplayName}</h1>
					</div>
					<p className="mt-2 text-center text-white">
						Participe {data.userJoinedDisplay}
					</p>
					{isLoggedInUser ? (
						<Form action="/logout" method="POST" className="mt-3">
							<Button type="submit" variant="secondary" size="pill">
								Sair
							</Button>
						</Form>
					) : null}
					<div className="mt-10 flex gap-4">
						{isLoggedInUser ? (
							<>
								<ButtonLink
									to="services"
									variant="primary"
									size="md"
									prefetch="intent"
								>
									Meus Serviços
								</ButtonLink>
								<ButtonLink
									to="/settings/profile"
									variant="secondary"
									size="md"
									prefetch="intent"
								>
									Editar Perfil
								</ButtonLink>
							</>
						) : (
							<ButtonLink
								to="services"
								variant="primary"
								size="md"
								prefetch="intent"
							>
								{userDisplayName} serviços/produtos
							</ButtonLink>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}

export const meta: V2_MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.user.name ?? params.username
	return [
		{ title: `${displayName} | Visite Vilatur` },
		{
			name: 'description',
			content: `Profile of ${displayName} on Visite Vilatur`,
		},
	]
}
