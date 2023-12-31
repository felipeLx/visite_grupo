import { type LoaderArgs, json} from "@remix-run/node";
import { prisma } from '~/utils/db.server';
import * as Popover from '@radix-ui/react-popover';
import { useLoaderData, useSearchParams, Form, Link, useSubmit, Outlet  } from "@remix-run/react";
import { getServiceImgSrc, getUserImgSrc } from "~/utils/misc";
import { Sidebar } from "~/components/sidebar";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Box } from "@chakra-ui/react";
import { ImagesVila } from "~/components/images";
import { BsWhatsapp, BsSearch } from 'react-icons/bs'; 
import { FaInternetExplorer } from 'react-icons/fa'; 
import { SiGooglemaps } from 'react-icons/si'; 
import { useEffect, useRef, useState } from "react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useUser } from '~/utils/user'
import { ButtonLink } from '~/utils/forms'
import { getUserId } from "~/utils/session.server";
import { getUserById } from "~/models/user.server";
import { getNoteListQuery } from "~/models/note.server";


type ImgData = {
  url: string;
}

const imagesVila: ImgData[] = [
  {url: "https://thumbs2.imgbox.com/7d/fb/eVSE6rba_t.jpg"},{url: "https://thumbs2.imgbox.com/0e/34/L6r1z9r2_t.jpg"}, 
  {url: "https://thumbs2.imgbox.com/6a/85/dIaimQ7O_t.jpg"},
  {url: "https://thumbs2.imgbox.com/fe/40/Eb4TO17z_t.jpg"},
   {url: "https://thumbs2.imgbox.com/fe/ee/o5nfMbt1_t.jpg"},
   {url: "https://thumbs2.imgbox.com/db/1e/8YZ68G2r_t.jpg"}
]

export const loader = async ({ request }: LoaderArgs) => {
  let notes = await prisma.note.findMany();
  
  let userId = await getUserId(request) || '';
  let user = await getUserById(userId);
  let url = new URL(request.url);
  let search = new URLSearchParams(url.searchParams);
  let query = search.get("keywords") as string

  let notesToLoad: any  = '';

  if(query) {
      notesToLoad = await getNoteListQuery(query);
    };
    notesToLoad = notesToLoad.length > 0 ? notesToLoad : notes
  
  return json({user, notes, notesToLoad});
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  
  return (
    <>
      <header className="relative bg-indigo-950">
        <nav className="flex">
          <div className="flex flex-row justify-between w-full py-4">
            {data.user ? (
              <UserDropdown />
            ) : (
              <ButtonLink to="/join" size="sm" variant="primary" className="m-2">
                Entrar
              </ButtonLink>
            )}
            <Form method="get" className="text-white flex flex-col justify-center itens-center">
              <div className="flex">
                <h3 className="text-3xl text-white lg:text-2xl sm:text-md"><BsSearch /></h3>
                <input
                  type="search"
                  name="keywords"
                  className="text-black text-base py-1 rounded-xl"
                  defaultValue={params.get("keywords") || ''}
                />
              </div>
            </Form>
          </div>
        </nav>
      </header>
      <section id="bunner" className="relative flex flex-col mt-2 pt-2 justify-center">
        <div className="sm:pb-2 sm:pt-8 flex-grow">
          <div className="mx-auto mb-4 max-w-7xl sm:px-6">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="/img/praia-vilatur.jpg"
                alt="Praia de Vilatur"
              />
              <div className="absolute inset-0 bg-[color:rgba(254,204,27,0.5)] mix-blend-multiply" />
            </div>
            <div className="relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-yellow-500 drop-shadow-md">
                  VISITE VILATUR
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl text-black sm:max-w-3xl">
                As diversas opções de serviços e produtos de Vilatur.
              </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <main>
        <section id="importants" className="relative flex flex-row mt-2 pt-2 justify-center">
          <Sidebar />
        </section>
        <section id="services" className="flex-1">
          <PopoverIndex />
          <Outlet />
        </section>
      </main>
    </>
  );
}

function PopoverIndex() {
  const data = useLoaderData<typeof loader>();
  const [services, setServices] = useState(data.notes || []);

  useEffect(() => {
    if(!data.notesToLoad) {
      return;
    }
    setServices(data.notesToLoad);
  }, [data]);
  
  return (
    <div className="mt-2 justify-center p-2">
      <div className="w-full flex flex-wrap right-0 justify-around space-x-2 space-y-2 items-center lg:justify-between sm:justify-center md:justify-center">
          {services.map((service: any) => (
            <div key={service.id} className="">
              <Popover.Root>
                <Popover.Trigger asChild>
                  <div
                    className="w-80 flex flex-col justify-center items-center text-center cursor-pointer rounded-sm shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] outline-none focus:shadow-[0_0_0_2px_white]"
                  >
                    <img
                      className="rounded-sm h-48 w-48 object-cover object-center"
                      src={getServiceImgSrc(service.imageId)}
                      alt={service.title}
                    />
                    <div className="flex flex-col px-2">
                      <h3 className="font-bold pl-2">{service.title}</h3>
                      <p className="p-2 font-light flex-wrap">{service.keywords}</p>
                    </div>
                  </div>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade w-[300px] rounded-md bg-white p-5 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:transition-all"
                    sideOffset={5}
                  >
                    <div className="flex flex-col gap-[7px]">
                      <img
                        className="block h-[60px] w-[60px] rounded-full object-cover"
                        src={getServiceImgSrc(service.imageId)}
                        alt={service.title}
                      />
                      <div className="flex flex-col gap-[15px]">
                        <div>
                          <div className="text-mauve12 m-0 text-[15px] font-bold text-lg leading-[1.5]">{service.title}</div>
                          <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">{service.content}</div>
                        </div>
                        <div className="text-mauve12 m-0 text-[15px] leading-[1.5]">
                        {service.keywords}
                        </div>
                        <div className="flex gap-[15px] justify-between items-center">
                          <div className="flex gap-[5px]">
                            <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Fale comigo:</div>
                            <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]"><a target="_blank" rel="noopener noreferrer" href={`https://wa.me/55${service.phone}`}><BsWhatsapp /></a></div>{' '}
                          </div>
                          <div className="flex gap-[5px]">
                            <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Faz Entrega</div>
                            <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">{service.delivery}</div>{' '}
                          </div>
                        </div>
                        <div className="flex gap-[15px] justify-between items-center">
                          <div className="flex gap-[5px]">
                            <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Abre às:</div>
                            <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">{service.open}</div>{' '}
                          </div>
                          <div className="flex gap-[5px]">
                            <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Fecha às:</div>
                            <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">{service.close}</div>{' '}
                          </div>
                        </div>
                        <div className="flex gap-[15px] justify-between items-center">
                          <div className="flex gap-[5px]">
                            <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Site:</div>
                            <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]"><a target="_blank" rel="noopener noreferrer" href={`${service.site}`}><FaInternetExplorer /></a></div>{' '}
                          </div>
                          <div className="flex gap-[5px]">
                            <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Estou aqui:</div>
                            <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]"><a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${service.latitud}%2C${service.longitud}`}><SiGooglemaps /></a></div>{' '}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Popover.Arrow className="fill-white" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          ))}
      </div>
    </div>
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
