import { cssBundleHref } from "@remix-run/css-bundle";

import { Sidebar } from "./components/sidebar";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	Form,
	Link,
	useSubmit,
	useLoaderData,
} from "@remix-run/react";
import { getUser } from "~/utils/session.server";
import fontStylestylesheetUrl from '~/styles/font.css'
import tailwindStylesheetUrl from '~/styles/tailwind.css'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
	json,
	type HeadersFunction,
	type LinksFunction,
	type LoaderArgs,
} from '@remix-run/node'
import { ButtonLink } from '~/utils/forms'
import { getUserImgSrc } from '~/utils/misc'
import { useNonce } from '~/utils/nonce-provider'
// import { makeTimings, time } from '~/utils/timing.server'
import { useUser } from '~/utils/user'
import { useRef } from 'react'

export const links: LinksFunction = () => {
	return [
		// Preload CSS as a resource to avoid render blocking
		{ rel: 'preload', href: fontStylestylesheetUrl, as: 'style' },
		{ rel: 'preload', href: tailwindStylesheetUrl, as: 'style' },
		
		{ rel: 'mask-icon', href: '/favicons/mask-icon.svg' },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{ rel: 'manifest', href: '/site.webmanifest' },
		{ rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' },
		{
			rel: 'icon',
			type: 'image/svg+xml',
			href: '/favicons/favicon-dark.svg',
			media: '(prefers-color-scheme: dark)',
		},
		{ rel: 'stylesheet', href: fontStylestylesheetUrl },
		{ rel: 'stylesheet', href: tailwindStylesheetUrl }
	].filter(Boolean)
}

export const loader = async ({ request }: LoaderArgs) => {
  return json({ user: await getUser(request), gaTrackingId: process.env.GOOGLE_TAG_ID });
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

export default function App() {
	//const location = useLocation();
	const { user, gaTrackingId } = useLoaderData<typeof loader>();
	const nonce = useNonce()
	//const user = useOptionalUser()

	return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="title" content="Visite Vilatur" />
        <meta property="og:image" content="/img/praia-vilatur.jpg" />
        <meta property="og:title" content="Vilatur: visite Vilatur" />
        <meta property="og:description" content="Visite Vilatur é uma página com os produtos, serviços e informações relevantes do bairro mais bohêmio de Saquarema. " />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vilatur.fly.dev/" />
        <meta name="description" content="Visite Vilatur é uma página com os produtos, serviços e informações relevantes do bairro mais bohemio de Saquarema. " />
        <meta name="keywords" content="Vilatur, Saquarema, Região dos Lagos, Itaúna, Turismo, Produtos, Serviços" />
        <Meta />
        <Links />
      </head>
      <body className="h-full items-center">
	  {process.env.NODE_ENV === "development" || !gaTrackingId ? null : (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
            />
            <script
              async
              id="gtag-init"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaTrackingId}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
            <script async src="https://www.googletagmanager.com/gtag/js?id=AW-11175127343"></script>
            <script 
              async
              id="gads-init"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-11175127343');`
              }} />
            <script async id="gads-event" dangerouslySetInnerHTML={{
              __html: `gtag('event', 'conversion', {'send_to': 'AW-11175127343/-pHcCNmV554YEK_S29Ap'});`}}>
            </script>
          </>
        )}
        <header className="container mx-auto">
			<nav className="flex justify-between ">
				<div className="flex w-full items-center gap-10 bg-indigo-950">
					{user ? (
						<UserDropdown />
					) : (
						<ButtonLink to="/login" size="sm" variant="primary" className="m-2">
							Entrar
						</ButtonLink>
					)}
				</div>
			</nav>
		</header>
        <Outlet />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
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
					className="flex flex-col rounded-3xl bg-[#323232]"
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
