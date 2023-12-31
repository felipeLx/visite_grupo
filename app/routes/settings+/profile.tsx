import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { json, redirect, type DataFunctionArgs } from '@remix-run/node'
import {
	Form,
	Link,
	Outlet,
	useActionData,
	useFormAction,
	useLoaderData,
	useNavigation,
	useSubmit
} from '@remix-run/react'
import { z } from 'zod'
import {
	getPasswordHash,
	verifyLogin,
} from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { ErrorList, Field } from '~/components/forms'
import { getUserImgSrc } from '~/utils/misc'
import {
	emailSchema,
	nameSchema,
	passwordSchema,
	usernameSchema,
} from '~/utils/user-validation'
import { StatusButton } from '~/components/ui/status-button'
import { Button } from '~/components/ui/button'
import { Icon } from '~/components/ui/icon'
import { getUserId } from '~/utils/session.server'
import { useRef } from "react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useUser } from '~/utils/user'

const profileFormSchema = z.object({
	name: nameSchema.optional(),
	username: usernameSchema,
	email: emailSchema.optional(),
	currentPassword: z
		.union([passwordSchema, z.string().min(0).max(0)])
		.optional(),
	newPassword: z.union([passwordSchema, z.string().min(0).max(0)]).optional(),
})

export async function loader({ request }: DataFunctionArgs) {
	const userId = await getUserId(request)
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			username: true,
			email: true,
			imageId: true,
		},
	})
	 
	if (!user) {
		return redirect("/")
	} 
	return json({ user })
	
}

export async function action({ request }: DataFunctionArgs) {
	const userId = await getUserId(request)
	const formData = await request.formData()
	const submission = await parse(formData, {
		async: true,
		schema: profileFormSchema.superRefine(
			async ({ username, currentPassword, newPassword }, ctx) => {
				if (newPassword && !currentPassword) {
					ctx.addIssue({
						path: ['newPassword'],
						code: 'custom',
						message: 'Must provide current password to change password.',
					})
				}
				if (currentPassword && newPassword) {
					const user = await verifyLogin(username, currentPassword)
					if (!user) {
						ctx.addIssue({
							path: ['currentPassword'],
							code: 'custom',
							message: 'Incorrect password.',
						})
					}
				}
			},
		),
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
	const { name, username, email, newPassword } = submission.value

	const updatedUser = await prisma.user.update({
		select: { id: true, username: true },
		where: { id: userId },
		data: {
			email,
			name,
			username,
			password: newPassword
				? {
					update: {
						hash: await getPasswordHash(newPassword),
					},
				  }
				: undefined,
		},
	})

	return redirect(`/users/${updatedUser.username}`, { status: 302 })
}

export default function EditUserProfile() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const navigation = useNavigation()
	const formAction = useFormAction()

	const isSubmitting =
		navigation.state === 'submitting' &&
		navigation.formAction === formAction &&
		navigation.formMethod === 'POST'

	const [form, fields] = useForm({
		id: 'edit-profile',
		constraint: getFieldsetConstraint(profileFormSchema),
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: profileFormSchema })
		},
		defaultValue: {
			username: data?.user?.username,
			name: data?.user?.name ?? '',
			email: data?.user?.email,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<>
			<header>
				<nav className="flex justify-between ">
				<div className="flex w-full items-center p-4 bg-indigo-950">
					<UserDropdown />
				</div>
				</nav>
			</header>
			<div className="container m-auto mb-36 mt-16 max-w-3xl">
				<div className="flex gap-3">
					<Link
						className="text-muted-foreground"
						to={`/users/${data?.user?.username}`}
					>
						Perfil
					</Link>
					<span className="text-muted-foreground">▶️</span>
					<span>Editar Perfil</span>
				</div>
				<div className="mt-16 flex flex-col gap-12">
					<div className="flex justify-center">
						<div className="relative h-52 w-52">
							<img
								src={getUserImgSrc(data?.user?.imageId)}
								alt={data?.user?.username}
								className="h-full w-full rounded-full object-cover"
							/>
							<Button
								asChild
								className="absolute -right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full p-0"
							>
								<Link
									preventScrollReset
									to="photo"
									title="Mudar a foto de perfil"
									aria-label="Mudar a foto de perfil"
								>
									<Icon name="camera" className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
					<Form method="POST" {...form.props}>
						<div className="grid grid-cols-6 gap-x-10">
							<Field
								className="col-span-3"
								labelProps={{
									htmlFor: fields.username.id,
									children: 'Username',
								}}
								inputProps={conform.input(fields.username)}
								errors={fields.username.errors}
							/>
							<Field
								className="col-span-3"
								labelProps={{ htmlFor: fields.name.id, children: 'Name' }}
								inputProps={conform.input(fields.name)}
								errors={fields.name.errors}
							/>
							<Field
								className="col-span-3"
								labelProps={{ htmlFor: fields.email.id, children: 'Email' }}
								inputProps={{
									...conform.input(fields.email),
									// TODO: support changing your email address
									disabled: false,
								}}
								errors={fields.email.errors}
							/>

							<div className="col-span-6 mb-12 mt-6 h-1 border-b-[1.5px]" />
							<fieldset className="col-span-6">
								<legend className="pb-6 text-lg">Alterar Senha</legend>
								<div className="flex justify-between gap-10">
									<Field
										className="flex-1"
										labelProps={{
											htmlFor: fields.currentPassword.id,
											children: 'Current Password',
										}}
										inputProps={{
											...conform.input(fields.currentPassword, {
												type: 'password',
											}),
											autoComplete: 'current-password',
										}}
										errors={fields.currentPassword.errors}
									/>
									<Field
										className="flex-1"
										labelProps={{
											htmlFor: fields.newPassword.id,
											children: 'New Password',
										}}
										inputProps={{
											...conform.input(fields.newPassword, { type: 'password' }),
											autoComplete: 'new-password',
										}}
										errors={fields.newPassword.errors}
									/>
								</div>
							</fieldset>
						</div>

						<ErrorList errors={form.errors} id={form.errorId} />

						<div className="mt-8 flex justify-center">
							<StatusButton
								type="submit"
								className='bg-indigo-950 text-white border-2 hover:border-yellow-500 active:border-green-500'
								status={isSubmitting ? 'pending' : actionData?.status ?? 'idle'}
							>
								Salvar Mudanças
							</StatusButton>
						</div>
					</Form>
				</div>
				<Outlet />
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
