import type { User, Note } from "@prisma/client";

import { prisma } from "~/utils/db.server";

export function getNote({
  id,
  ownerId,
}: Pick<Note, "id"> & {
  ownerId: User["id"];
}) {
  return prisma.note.findFirst({
    select: { id: true, content: true, title: true },
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

export function createNote({
  content,
  title,
  ownerId,
}: Pick<Note, "content" | "title"> & {
  ownerId: User["id"];
}) {
  return prisma.note.create({
    data: {
      title,
      content,
      owner: {
        connect: {
          id: ownerId,
        },
      },
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
