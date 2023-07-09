import {
	json,
	type DataFunctionArgs,
	type HeadersFunction,
} from '@remix-run/node'
import { Link, NavLink, Outlet, useLoaderData, Form, useSubmit } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Icon } from '~/components/ui/icon'
import { prisma } from '~/utils/db.server'
import { cn, getUserImgSrc } from '~/utils/misc'
import {
	combineServerTimings,
	makeTimings,
	time,
} from '~/utils/timing.server'
import { useRef } from "react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useUser } from '~/utils/user'

export async function loader({ params }: DataFunctionArgs) {
	const timings = makeTimings('notes loader')
	const owner = await time(
		() =>
			prisma.user.findUnique({
				where: {
					username: params.username,
				},
				select: {
					id: true,
					username: true,
					name: true,
					imageId: true,
				},
			}),
		{ timings, type: 'find user' },
	)
	if (!owner) {
		throw new Response('Not found', { status: 404 })
	}
	const notes = await time(
		() =>
			prisma.note.findMany({
				where: {
					ownerId: owner.id,
				},
				select: {
					id: true,
					title: true,
				},
			}),
		{ timings, type: 'find notes' },
	)
	return json(
		{ owner, notes },
		{ headers: { 'Server-Timing': timings.toString() } },
	)
}

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
	return {
		'Server-Timing': combineServerTimings(parentHeaders, loaderHeaders),
	}
}

export default function NotesRoute() {
	const data = useLoaderData<typeof loader>()
	const ownerDisplayName = data.owner.name ?? data.owner.username
	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'
	return (
		<>
			<header>
				<nav className="flex justify-between ">
				<div className="flex w-full items-center p-4 bg-indigo-950">
					<UserDropdown />
				</div>
				</nav>
			</header>
			<div className="flex h-full pb-12">
				<div className="mx-auto grid w-full flex-grow grid-cols-4 bg-muted pl-2 md:container md:rounded-3xl md:pr-0">
					<div className="col-span-1 py-12">
						<Link
							to={`/users/${data.owner.username}`}
							className="mb-4 flex flex-col items-center justify-center gap-2 pl-8 pr-4 lg:flex-col lg:justify-start lg:gap-4"
						>
							<img
								src={getUserImgSrc(data.owner.imageId)}
								alt={ownerDisplayName}
								className="h-16 w-16 rounded-full object-cover lg:h-24 lg:w-24"
							/>
							<h1 className="flex flex-wrap p-2 text-center text-base font-bold md:text-lg lg:text-left lg:text-2xl">
								{ownerDisplayName} Serviços
							</h1>
						</Link>
						<ul>
							<li>
								<NavLink
									to="new"
									className={({ isActive }) =>
										cn(navLinkDefaultClassName, isActive && 'bg-accent')
									}
								>
									<Icon name="plus">Novo Produto ou Serviço</Icon>
								</NavLink>
							</li>
							{data.notes.map(note => (
								<li key={note.id}>
									<NavLink
										to={note.id}
										className={({ isActive }) =>
											cn(navLinkDefaultClassName, isActive && 'bg-accent')
										}
									>
										{note.title}
									</NavLink>
								</li>
							))}
						</ul>
					</div>
					<main className="col-span-3 bg-accent px-10 py-12 md:rounded-r-3xl">
						<Outlet />
					</main>
				</div>
			</div>
		</>
	)
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
