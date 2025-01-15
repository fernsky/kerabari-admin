import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { users } from "@/server/db/schema/basic";
import { eq } from "drizzle-orm";

export const adminRouter = createTRPCRouter({
  getEnumerators: protectedProcedure.query(async ({ ctx }) => {
    const enumerators = await ctx.db
      .select()
      .from(users)
      .where(eq(users.role, "enumerator"));

    return enumerators;
  }),
});
