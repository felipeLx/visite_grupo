import type { User, Note } from "@prisma/client";

import { prisma } from "~/utils/db.server";

export function getNote({
  id,
  ownerId
}: Pick<Note, "id"> & {
  ownerId: User["id"] 
}) {

  return prisma.note.findFirst({
    select: { id: true, content: true, title: true, keywords: true, imageId: true, ownerId: true },
    where: { id, ownerId },
  });
}

export function getNoteListItems({ ownerId }: { ownerId: User["id"] }) {
  return prisma.note.findMany({
    where: { ownerId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getNoteListQuery(query?: string | null) {
  let notes: Note[] | any = await prisma.note.findMany();
  console.log(notes)
  if(query && notes) {
    notes = notes.filter((note: any) => 
      note.site?.toLowerCase().includes(query.toLowerCase()) ||
      note.title?.toLowerCase().includes(query.toLowerCase()) ||
      note.content?.toLowerCase().includes(query.toLowerCase()) ||
      note.keywords?.toLowerCase().includes(query.toLowerCase())
    )
  }

  return notes;
}

export function createNote({
  content,
  title,
  ownerId,
  phone,
  site,
  open,
  close,
  delivery,
  latitud,
  longitud,
  keywords
}: Pick<Note, "content" | "title" | "phone"  | "site"  | "open"  | "close" | "delivery"  | "latitud"  | "longitud" | "keywords"> & {
  ownerId: User["id"];
}) {
  return prisma.note.create({
    data: {
      title,
      content,
      phone,
      site,
      open,
      close,
      delivery,
      latitud,
      longitud,
      keywords,
      owner: {
        connect: {
          id: ownerId,
        },
      }
    },
  });
}

export function deleteNote({
  id,
  ownerId,
}: Pick<Note, "id"> & { ownerId: User["id"] }) {
  return prisma.note.delete({
    where: { id },
  });
}
