//import { Sidebar } from "./components/sidebar";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";
import { getUser } from "~/utils/session.server";
import {
	json,
	type HeadersFunction,
	type LinksFunction,
	type LoaderArgs,
} from '@remix-run/node'
import { useNonce } from '~/utils/nonce-provider'
import { cssBundleHref } from "@remix-run/css-bundle";
import fontStylestylesheetUrl from '~/styles/font.css'
import tailwindStylesheetUrl from '~/styles/tailwind.css'

export const links: LinksFunction | any = () => {
	return [
		// Preload CSS as a resource to avoid render blocking
		{ rel: 'preload', href: fontStylestylesheetUrl, as: 'style' },
		{ rel: 'preload', href: tailwindStylesheetUrl, as: 'style' },
		cssBundleHref ? { rel: 'preload', href: cssBundleHref, as: 'style' } : null,
		{ rel: 'mask-icon', href: '/favicon.ico' },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{ rel: 'manifest', href: '/site.webmanifest' },
		{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.ico' },
		{
			rel: 'icon',
			type: 'image/svg+xml',
			href: '/favicons/favicon-dark.svg',
			media: '(prefers-color-scheme: dark)',
		},
		{ rel: 'stylesheet', href: fontStylestylesheetUrl },
		{ rel: 'stylesheet', href: tailwindStylesheetUrl },
		cssBundleHref ? { rel: 'stylesheet', href: cssBundleHref } : null,
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
	const { gaTrackingId } = useLoaderData<typeof loader>();
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
            {/*<script async src="https://www.googletagmanager.com/gtag/js?id=AW-11175127343"></script>
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
			</script>*/}
          </>
        )}
        
        <Outlet />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}
