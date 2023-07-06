import { type V2_MetaFunction, type LoaderArgs, json } from "@remix-run/node";
// import { Link } from "@remix-run/react";
import { prisma } from '~/utils/db.server';
import * as HoverCard from '@radix-ui/react-hover-card';
//import { useOptionalUser } from "~/utils";
import { useLoaderData } from "@remix-run/react";
import { getServiceImgSrc } from "~/utils/misc";
import { Sidebar } from "~/components/sidebar";
import { BsWhatsapp } from 'react-icons/bs'; 
import { FaInternetExplorer } from 'react-icons/fa'; 
import { SiGooglemaps } from 'react-icons/si'; 

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

export default function Index() {  
  return (
    <main>
      <div className="flex flex-col sm:pb-16 sm:pt-8">
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
            </div>
          </div>
        </div>

          <nav className="flex rounded-lg justify-center items-center">
            <Sidebar />
          </nav>
        <section>
          <HoverCardIndex />
        </section>
      </div>
    </main>
  );
}

function HoverCardIndex() {
  const data = useLoaderData<typeof loader>();
  let services = data.notes;
  let keywords = data.keywords;
  let transformedKeywords = keywords.flatMap((word: any) => {
    if (word.words.includes(",")) {
      return word.words.split(",").map((keyword: any) => ({
        serviceId: word.serviceId,
        words: keyword.trim()
      }));
    } else {
      return {
        serviceId: word.serviceId,
        words: word.words.trim()
      };
    }
  }); //.map((word: any) => word.words.includes(","))
  return (
    <div>
      <div className="flex flex-wrap gap-4 p-4 m-2 justify-between">
          {services.map((service: any) => (
            <div key={service.id} className="flex">
              <HoverCard.Root>
                <HoverCard.Trigger asChild>
                  <div
                    className="flex w-96 justify-center items-center cursor-pointer rounded-sm shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] outline-none focus:shadow-[0_0_0_2px_white]"
                  >
                    <img
                      className="block h-[150px] w-[150px] rounded-sm  object-cover"
                      src={getServiceImgSrc(service.imageId)}
                      alt={service.title}
                    />
                    <div className="flex flex-col px-2">
                      <h3 className="font-bold pl-2">{service.title}</h3>
                      <p className="p-2 font-light flex">{transformedKeywords.filter(w => w.serviceId === service.id).map(word => word.words + ", ")}</p>
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
                    <HoverCard.Arrow className="fill-white" />
                  </HoverCard.Content>
                </HoverCard.Portal>
              </HoverCard.Root>
            </div>
          ))}
      </div>
    </div>
  );
}