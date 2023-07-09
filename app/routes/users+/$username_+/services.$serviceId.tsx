import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Link,
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { deleteNote, getNote } from "~/models/note.server";
import { getUserByUsername } from "~/models/user.server";
import { Button } from '~/utils/forms';
import { Icon } from '~/components/ui/icon'
import { prisma } from '~/utils/db.server'
import { getServiceImgSrc } from "~/utils/misc";
import { DeleteNote } from "~/routes/resources+/delete-note";

export const loader = async ({ params, request }: LoaderArgs) => {
  let username: string = params.username ?? '';
  const owner = await getUserByUsername(username);

  invariant(params.serviceId, "Serviço não encontrado");
  let idParams = params.serviceId || '';
  
  if (!owner) {
    throw new Response("Você deve fazer login antes de Cadastrar um serviço.", { status: 404 });
  }
  const note = await getNote({ id: idParams, ownerId: owner.id });
  if (!note) {
    throw new Response("Serviço não encontrado", { status: 404 });
  }

  return json({ note, username, isOwner: owner.id === note.ownerId });
};

export const action = async ({ params, request }: ActionArgs) => {
  let username: string = params.username ?? '';
  const owner = await getUserByUsername(username);
  const formData = await request.formData()
  
  invariant(params.serviceId, "Serviço não encontrado");
  let idParams = params.serviceId || '';
  
  if (!owner) {
    throw new Response("Você deve fazer login antes de Cadastrar um serviço.", { status: 304 });
  }
  
  if(formData.get('intent') === 'save-keywords') {
    const keywords = formData.get('keywords') as string;
    let transformedKeywords = [...new Set(keywords.trim().replace(/(\s+)/g, '').replace(/[^a-zA-Z,]/g, ', ').split(','))]
    console.log('trKey',transformedKeywords)
/*  
    const data = {
      words: transformedKeywords,
      serviceId: idParams
    }
  
    const select = {
      id: true,
      words: true,
      serviceId: true
    }
  */  
    new Promise(() => transformedKeywords.map(async(trK: any) => {
      return await prisma.note.update({
        where: {id: idParams},
        data: {
          keywords: {upsert: {
            words: trK
          }}
        },
      })
    }))
    
    //let newKeywords = await prisma.keywords.create({ data, select })
    let note = await getNote({id: params.serviceId, ownerId: owner.id})
    
    return ({ note, keywords })
  }

  if(formData.get("intent") === "delete") {
    let id = formData.get('serviceId') as string;
    await deleteNote({ id: id, ownerId: owner.id });
    return redirect("/services");
  }
};

export default function ServiceDetailsPage() {
  const data = useLoaderData<typeof loader>();
  
  /* const wordsEditorFetcher = useFetcher<typeof action>()
  let [keywords, setKeywords] = useState<string>('');

  let cleannedKeywords = data?.keywords?.words
  console.log(cleannedKeywords)
  const handleKeywords = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setKeywords(event.currentTarget.value);
  };
   */
  return (
    <div className="container mt-16 flex flex-col gap-12">
      <div className="flex justify-center">
					<div className="relative h-52 w-52">
						<img
							src={getServiceImgSrc(data?.note?.imageId)}
							alt={data?.note.title}
							className="h-full w-full rounded-full object-cover"
						/>
						<Button
              size='sm'
							variant="primary"
              className="absolute -right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full p-0"
						>
							<Link
								preventScrollReset
								to="photo"
								title="Mudar a foto do serviço"
								aria-label="Mudar a foto do serviço"
							>
								<Icon name="camera" className="h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
      <h3 className="text-2xl font-bold">{data.note.title}</h3>
      <p className="py-6">{data.note.content}</p>
      {/*  Pop-over para adicionar keywords */}
      <p className="py-6">{data.note.keywords}</p>
      
      {data.isOwner ? (
				<div className="flex justify-end gap-4">
					<DeleteNote id={data.note.id} />
					<Button size='sm' variant='primary' className="cursor-pointer">
						<Link to="edit">Editar</Link>
					</Button>
				</div>
			) : null}
      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Serviço não encontrado</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}

/*
{!cleannedKeywords && 
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              className="rounded-full p-2 w-[200px] h-[35px] inline-flex items-center justify-center text-violet11 bg-slate-950 text-white shadow-[0_2px_10px] shadow-blackA7 hover:bg-slate-700 active:bg-green-700 focus:shadow-[0_0_0_2px] focus:shadow-black cursor-default outline-none"
              aria-label="Click para adicionar palavras chaves"
            >
              Adicionar Palavras Chave
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="rounded p-5 w-auto bg-white shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade"
              sideOffset={5}
            >
              <div className="flex flex-col gap-2.5">
                <p className="text-mauve12 text-xl leading-[19px] font-bold mb-2.5">Coloque palavras únicas e separadas por vírgula</p>
                <em>exemplo: criança, comida, lanche, animais, delivery, artesanato, chaveiro, rede, flores, arranjos</em>
                <wordsEditorFetcher.Form
                  method="POST"
                  action={`/users/${data.username}/services/${data.note.id}`}                
                >
                  <fieldset className="flex gap-5 items-center">
                    <div className="flex flex-col w-full h-[60px] items-center">
                      <input
                        id="keywords"
                        name="keywords"
                        autoComplete='keywords'
                        value={keywords}
                        onChange={handleKeywords}
                        className='text-white w-full h-40 bg-black p-2 items-center'
                      />
                    </div>
                  </fieldset>
                  <div className="flex justify-center gap-4 mt-2">
                    <button
                      type="submit"
                      name="intent"
                      value="save-keywords"
                      className="rounded bg-slate-950 px-4 py-2 text-white hover:bg-slate-500 focus:bg-slate-600"
                    >
                      Gravar
                    </button>
                  </div>
                </wordsEditorFetcher.Form>
              </div>
              <Popover.Close
                className="rounded-full h-[25px] w-[25px] inline-flex items-center justify-center text-violet11 absolute top-[5px] right-[5px] hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 outline-none cursor-default"
                aria-label="Close"
              >
                <Cross2Icon />
              </Popover.Close>
              <Popover.Arrow className="fill-white" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      }
      <hr className="my-4" />
*/