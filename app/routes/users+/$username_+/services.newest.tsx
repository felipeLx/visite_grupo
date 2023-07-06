/* import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "~/components/ui/icon";
import { conform, useForm } from '@conform-to/react'
import { createNote } from "~/models/note.server";
import { Button } from "~/utils/forms";
import { getServiceImgSrc } from "~/utils/misc";
import { requireUserId, getUser, getUserId } from "~/utils/session.server";
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { z } from 'zod';
import { prisma } from '~/utils/db.server';
import { redirectWithToast } from '~/utils/flash-session.server'

export const loader = async ({params, request}: LoaderArgs) => {
  let user = await getUser(request);
  
  return json({ user });
}

export const NoteEditorSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	content: z.string().min(1),
  site: z.string().min(1),
	phone: z.string().min(1),
  latitud: z.string().min(1),
	longitud: z.string().min(1),
  open: z.string().min(1),
	close: z.string().min(1),
  delivery: z.string().min(1),
  keywords: z.string().min(1),
})

export const action = async ({ request }: ActionArgs) => {
  const ownerId = await getUserId(request);
  console.log('ownerId', ownerId)
  const formData = await request.formData()
	const submission = parse(formData, {
		schema: NoteEditorSchema,
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
	let note: { id: string; owner: { username: string, name: string, email: string } }

	const { title, content, id, site, phone, latitud, longitud, delivery, keywords } = submission.value
  
  const regex = /[0-9]+/i;
  let phoneNumbers = phone.replace(regex, '');
  let deliveryBool = delivery === 'on' ? "Sim" : "Não";
  if(typeof content !== "string" || typeof title !== "string" || typeof site !== "string" ||
  typeof open !== "string" || typeof close !== "string" || typeof delivery !== "string" ||
  typeof latitud !== "string" || typeof longitud !== "string" || typeof keywords !== "string"
  || typeof deliveryBool !== "string") {
    return {error: "Formulário não preenchido corretamente."}
  }

	const data = {
		ownerId: ownerId,
		title: title,
		content: content,
		site: site,
		phone: phoneNumbers,
		latitud: latitud,
		longitud: longitud,
		delivery: deliveryBool,
		keywords: {create: [
      {words: keywords },
    ]},
	}
  console.log('data', data)

  const select = {
		id: true,
		owner: {
			select: {
				username: true,
        name: true
			},
		},
	}
  if (id) {
		const existingNote = await prisma.note.findFirst({
			where: { id, ownerId },
			select: { id: true, ownerId: true },
		})
		if (!existingNote) {
			return json(
				{
					status: 'error',
					submission,
				} as const,
				{ status: 404 },
			)
		}
		note = await prisma.note.update({
			where: { id },
			data,
			select,
		})
	} else {
		note = await prisma.note.create({ data, select })
	}
	console.log('note', note)
  return redirectWithToast(`/users/${note.owner.username}/services/${note.id}`, {
		title: id ? 'Note updated' : 'Note created',
	})
};

export default function NewServicePage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const formRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [keywords, setKeywords] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [isIn, setIsIn] = useState(false);
  const handleInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsIn(!isIn); setIsOut(false);
  };
  const [isOut, setIsOut] = useState(false);
  
  const handleOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsOut(!isOut);
    setIsIn(false);
  };

  useEffect(() => {
    if (actionData?.error) {
      formRef.current?.focus();
    }
  }, [actionData]);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPhone(e.currentTarget.value)
  };
  
  const handleKeywordsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setKeywords(e.currentTarget.value)
  };

  const handleLatitudInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setLatitud(e.currentTarget.value)
  };
  
  const handleLongitudInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setLongitud(e.currentTarget.value)
  };
  
  const handleTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTitle(e.currentTarget.value)
  };
  
  const handleDescriptionInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setDescription(e.currentTarget.value)
  };

  return (
    <div>
      <Form
        method="POST"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Título do Serviço ou Produto: </span>
            <input
              value={title}
              name="title"
              onChange={handleTitleInput}
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"            
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Descrição: </span>
            <textarea
              value={description}
              name="content"
              rows={8}
              onChange={handleDescriptionInput}
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Palavras chave: </span>
            <input
              type="text"
              name="keywords"
              value={keywords}
              placeholder="delivery, cachorro-quente, bebidas, água, gelo, camarão (usar vírgula)"
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
              onChange={handleKeywordsInput}
            />
          </label>
        </div>
        <div className="flex flex-row justify-between">
        <div className="grow px-2">
          <label className="flex w-full flex-col gap-1">
            <span>Telefone: </span>
            <input
              type="text"
              name="phone"
              placeholder="229993875492 (somente números e com Whatsapp)"
              value={phone}
              className="w-full grow rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
              onChange={handlePhoneInput}
            />
          </label>
        </div>
        <div className="grow px-2">
          <label className="flex w-full flex-col gap-1">
            <span>Site: </span>
            <input
              type="text"
              name="site"
              placeholder="https://meusite.com.br ou https://facebook.com/meuUsuario"
              className="w-full grow rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            />
          </label>
        </div>
        </div>
        <div className="flex flex-row justify-between">
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Abre às: </span>
            <input
              type="time"
              name="open"
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            />
          </label>
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Fecha às: </span>
            <input
              type="time"
              name="close"
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            />
          </label>
        </div>
        
        <div className="flex-none rounded-md border-2 border-blue-500 px-3 py-2">
          <label className="flex w-full flex-col gap-1">
            <span>Faz Entrega? </span>
            <div className="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
              <input
                className="relative float-left -ml-[1.5rem] mr-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:bg-indigo-950 checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] 
                checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                type="checkbox"              
                checked={isIn}
                onChange={handleInChange}
                id="checkboxDefault" />
              <label
                className="inline-block pl-[0.15rem] hover:cursor-pointer"
                htmlFor="checkboxDefault">
                Sim
              </label>
            </div>
            <div className="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
              <input
                className="relative float-left -ml-[1.5rem] mr-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] checked:bg-indigo-950 appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                type="checkbox"
                checked={isOut}
                onChange={handleOutChange}
                id="checkboxChecked"
                />
              <label
                className="inline-block pl-[0.15rem] hover:cursor-pointer"
                htmlFor="checkboxChecked">
                Não
              </label>
            </div>
          </label>
        </div>
          
          <div>
            <label className="flex w-full flex-col gap-1">
              <span>Latitude: </span>
              <input
                type="text"
                name="latitud"
                value={latitud}
                onChange={handleLatitudInput}
                placeholder="-22.8988856"
                className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
              />
            </label>
          </div>
          <div>
            <label className="flex w-full flex-col gap-1">
              <span>Longitude: </span>
              <input
                type="text"
                name="longitud"
                value={longitud}
                onChange={handleLongitudInput}
                placeholder="-42.4406357"
                className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
              />
            </label>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-xl font-bold text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Guardar
          </button>
        </div>
      </Form>
    </div>
  );
}
 */