import type { User, Note, Keywords } from "@prisma/client";

import { prisma } from "~/utils/db.server";


export function getKeywords({
  serviceId,
}: Pick<Keywords, "serviceId">) {
  return prisma.keywords.findFirst({
    select: { id: true, words: true },
    where: { serviceId },
  });
}

export function getNote({
  id,
  ownerId,
}: Pick<Note, "id"> & {
  ownerId: User["id"];
}) {
  return prisma.note.findFirst({
    select: { id: true, content: true, title: true, keywords: true, imageId: true },
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
export function editNoteKeywords({
  id,
  keywords
}: Pick<Note, "id"> & {
  keywords: Keywords["words"]
}) {
  return prisma.keywords.create({
    data: {
      words: keywords,
      note: {
        connect: {
          id: id,
        },
      }
    }
  })
};

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
  longitud
}: Pick<Note, "content" | "title" | "phone"  | "site"  | "open"  | "close" | "delivery"  | "latitud"  | "longitud"> & {
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
  return prisma.note.deleteMany({
    where: { id, ownerId },
  });
}
