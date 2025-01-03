import { generateId } from "lucia";
import type { ProtectedTRPCContext } from "../../trpc";
import type {
  CreatePartInput,
  DeletePartInput,
  GetPartInput,
  ListPartsInput,
  MyPartsInput,
  UpdatePartInput,
} from "./part.input";
import { parts } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const listParts = async (ctx: ProtectedTRPCContext, input: ListPartsInput) => {
  return ctx.db.query.parts.findMany({
    offset: (input.page - 1) * input.perPage,
    limit: input.perPage,
    orderBy: (table, { desc }) => desc(table.createdAt),
    columns: {
      id: true,
      title_en: true,
      title_ne: true,
      createdAt: true,
    },
  });
};

export const getPart = async (ctx: ProtectedTRPCContext, { id }: GetPartInput) => {
  return ctx.db.query.parts.findFirst({
    where: (table, { eq }) => eq(table.id, id),
  });
};

export const createPart = async (ctx: ProtectedTRPCContext, input: CreatePartInput) => {
  const id = generateId(15);

  await ctx.db.insert(parts).values({
    id,
    title_en: input.title_en,
    title_ne: input.title_ne,
  });

  return { id };
};

export const updatePart = async (ctx: ProtectedTRPCContext, input: UpdatePartInput) => {
  const [item] = await ctx.db
    .update(parts)
    .set({
      title_en: input.title_en,
      title_ne: input.title_ne,
    })
    .where(eq(parts.id, input.id))
    .returning();

  return item;
};

export const deletePart = async (ctx: ProtectedTRPCContext, { id }: DeletePartInput) => {
  const [item] = await ctx.db.delete(parts).where(eq(parts.id, id)).returning();
  return item;
};

export const myParts = async (ctx: ProtectedTRPCContext, input: MyPartsInput) => {
  return ctx.db.query.parts.findMany({
    offset: (input.page - 1) * input.perPage,
    limit: input.perPage,
    orderBy: (table, { desc }) => desc(table.createdAt),
    columns: {
      id: true,
      title_en: true,
      title_ne: true,
      createdAt: true,
    },
  });
};
