import { type V2_MetaFunction, type LoaderArgs, json } from "@remix-run/node";
// import { Link } from "@remix-run/react";
import { prisma } from '~/utils/db.server';
import * as HoverCard from '@radix-ui/react-hover-card';
import { useOptionalUser } from "~/utils";
import { useLoaderData } from "@remix-run/react";
import { getServiceImgSrc } from "~/utils/misc";
import { Sidebar } from "~/components/sidebar";

export const loader = async ({ request }: LoaderArgs) => {
  let notes = await prisma.note.findMany();
  let keywords = await prisma.keywords.findMany();
  
  return json({notes, keywords});
};


export const meta: V2_MetaFunction = () => {
  return [{
    title: "Visite Vilatur",
    description:
      "Vilatur, bairro de Saquarema. Site com as propostas de serviços, produtos e eventos de Vilatur, Saquarema, Rio de Janeiro.",
  }];
};
/* 
type CommentData = {
  text: string;
  name: string;
  job: string;
}

const comments: CommentData[] = [
  {
    text: "Agradeço a atenção durante todo o processo!",
    name: "João Dias",
    job: "Estágio de Engenharia",
  },
  {
    text: "Eles me ligaram e já marcaram a data de início, obrigado pelo processo rápido!",
    name: "Mariana Almeida",
    job: "Representante de Venda",
  }
]
 */
export default function Index() {
  
  return (
    <main className="static flex bg-white sm:flex-col sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
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
              {/*<div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                {user ? (
                  <Link
                    to="/services"
                    className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
                  >
                    Veja os serviços para {user.email}
                  </Link>
                ) : (
                  <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                    <Link
                      to="/join"
                      className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
                    >
                      Sair
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600"
                    >
                      Entrar
                    </Link>
                  </div>
                )}
                </div>*/}
              {/*<a href="https://remix.run">
                <img
                  src="https://user-images.githubusercontent.com/1500684/158298926-e45dafff-3544-4b69-96d6-d3bcc33fc76a.svg"
                  alt="Remix"
                  className="mx-auto mt-16 w-full max-w-[12rem] md:max-w-[16rem]"
                />
              </a>*/}
            </div>
          </div>
        </div>

          <nav className="flex rounded-lg justify-center items-center">
            <Sidebar />
          </nav>
        <div className="flex ml-4 px-4 py-2 sm:px-6 lg:px-8">
          <div className="mt-6 flex-wrap justify-center gap-8 space-x-4 sm:flex-col md:flex-col">
            <HoverCardIndex />
          </div>
        </div>
      </div>
    </main>
  );
}

function HoverCardIndex() {
  const data = useLoaderData<typeof loader>();
  let services = data.notes;
  let keywords = data.keywords;

  return (
    <div className="flex flex-col gap-8 justify-center items-center text-center lg:flex-row md:flex-col sm:flex-col">
        {services.map((service: any) => (
          <div key={service.id} className="">
            <HoverCard.Root>
              <HoverCard.Trigger asChild>
                <div
                  className="flex justify-center items-center cursor-pointer rounded-sm shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] outline-none focus:shadow-[0_0_0_2px_white]"
                >
                  <img
                    className="block h-[150px] w-[150px] rounded-sm"
                    src={getServiceImgSrc(service.imageId)}
                    alt={service.title}
                  />
                  <div className="flex-row">
                    <h3 className="font-bold">{service.title}</h3>
                    <p className="font-light">{keywords.filter(w => w.serviceId === service.id).map(word => word.words + ", ")}</p>
                  </div>
                </div>
              </HoverCard.Trigger>
              <HoverCard.Portal>
                <HoverCard.Content
                  className="data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade w-[300px] rounded-md bg-white p-5 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:transition-all"
                  sideOffset={5}
                >
                  <div className="flex flex-col gap-[7px]">
                    <img
                      className="block h-[60px] w-[60px] rounded-full"
                      src={getServiceImgSrc(service.imageId)}
                      alt={service.title}
                    />
                    <div className="flex flex-col gap-[15px]">
                      <div>
                        <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">{service.title}</div>
                        <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">{service.content}</div>
                      </div>
                      <div className="text-mauve12 m-0 text-[15px] leading-[1.5]">
                      {service.keywords}
                      </div>
                      <div className="flex gap-[15px]">
                        <div className="flex gap-[5px]">
                          <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">{service.phone}</div>{' '}
                          <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Tel.:</div>
                        </div>
                        <div className="flex gap-[5px]">
                          <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">{service.delivery}</div>{' '}
                          <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Faz Entrega</div>
                        </div>
                      </div>
                      <div className="flex gap-[15px]">
                        <div className="flex gap-[5px]">
                          <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">{service.open}</div>{' '}
                          <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Aberto às:</div>
                        </div>
                        <div className="flex gap-[5px]">
                          <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">{service.close}</div>{' '}
                          <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Fechado às:</div>
                        </div>
                      </div>
                    </div>
                  </div>
      
                  <HoverCard.Arrow className="fill-white" />
                </HoverCard.Content>
              </HoverCard.Portal>
            </HoverCard.Root>
          </div>
        ))}
    </div>
  );
}