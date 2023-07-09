import {
	json,
	type DataFunctionArgs,
	type V2_MetaFunction,
} from '@remix-run/node'
import { Form, useLoaderData, useSubmit, Link } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Spacer } from '~/components/spacer'
import { prisma } from '~/utils/db.server'
import { Button, ButtonLink } from '~/utils/forms'
import { getUserImgSrc } from '~/utils/misc'
import { useOptionalUser, useUser } from '~/utils/user'
import { useRef } from "react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'


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
	
	return (
		<>
			<header>
				<nav className="flex justify-between ">
				<div className="flex w-full items-center p-4 bg-indigo-950">
					<UserDropdown />
				</div>
				</nav>
			</header>
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
		</>
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



function UserDropdown() {
	const user = useUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<Link
					to={`/users/${user.username}`}
					// this is for progressive enhancement
					onClick={e => e.preventDefault()}
					className="bg-brand-500 hover:bg-brand-400 focus:bg-brand-400 radix-state-open:bg-brand-400 flex items-center gap-2 rounded-full py-2 pl-2 pr-4 outline-none"
				>
					<img
						className="h-8 w-8 rounded-full object-cover"
						alt={user.name ?? user.username}
						src={getUserImgSrc(user.imageId)}
					/>
					<span className="text-body-sm font-bold text-white">
						{user.name ?? user.username}
					</span>
				</Link>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					sideOffset={8}
					align="start"
					className="flex flex-col rounded-3xl bg-indigo-950 text-white"
				>
					<DropdownMenu.Item asChild>
						<Link
							prefetch="intent"
							to={`/users/${user.username}`}
							className="hover:bg-brand-500 radix-highlighted:bg-brand-500 rounded-t-3xl px-7 py-5 outline-none"
						>
							Perfil
						</Link>
					</DropdownMenu.Item>
					<DropdownMenu.Item asChild>
						<Link
							prefetch="intent"
							to={`/users/${user.username}/services`}
							className="hover:bg-brand-500 radix-highlighted:bg-brand-500 px-7 py-5 outline-none"
						>
							Serviços
						</Link>
					</DropdownMenu.Item>
					<DropdownMenu.Item
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={event => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Form
							action="/logout"
							method="POST"
							className="radix-highlighted:bg-brand-500 rounded-b-3xl outline-none"
							ref={formRef}
						>
							<button type="submit" className="px-7 py-5">
								Sair
							</button>
						</Form>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}
