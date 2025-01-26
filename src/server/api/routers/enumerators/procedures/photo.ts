import { protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { users } from "@/server/db/schema/basic";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { env } from "@/env";

export const enumeratorPhotoProcedures = {
  uploadIdCardPhoto: protectedProcedure
    .input(
      z.object({
        photo: z.string(),
        enumeratorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be an admin to upload ID card photos",
        });
      }

      if (!process.env.BUCKET_NAME) {
        throw new Error("Bucket name not configured");
      }

      // Get file extension from base64 string
      const matches = input.photo.match(/^data:image\/([a-zA-Z]+);base64,/);
      if (!matches) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid image format",
        });
      }
      const fileExtension = matches[1];
      const buffer = Buffer.from(input.photo.split(",")[1], "base64");
      const fileName = `${input.enumeratorId}-id-card-photo.${fileExtension}`;

      try {
        await ctx.minio.putObject(process.env.BUCKET_NAME, fileName, buffer);

        await ctx.db
          .update(users)
          .set({ avatar: fileName })
          .where(eq(users.id, input.enumeratorId));

        return { success: true };
      } catch (error) {
        console.error("Failed to upload photo:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload photo",
        });
      }
    }),

  updateMyPhoto: protectedProcedure
    .input(
      z.object({
        photo: z.string().regex(/^data:image\/(jpeg|jpg|png);base64,/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!process.env.BUCKET_NAME) {
        throw new Error("Bucket name not configured");
      }

      try {
        const matches = input.photo.match(/^data:image\/([a-zA-Z]+);base64,/);
        if (!matches) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid image format",
          });
        }

        const fileExtension = matches[1];
        const base64Data = input.photo.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const fileName = `${ctx.user.id}-avatar.${fileExtension}`;

        // Add content type metadata
        const metaData = {
          "Content-Type": `image/${fileExtension}`,
        };

        await ctx.minio.putObject(
          process.env.BUCKET_NAME,
          fileName,
          buffer,
          buffer.length,
          metaData,
        );

        await ctx.db
          .update(users)
          .set({ avatar: fileName })
          .where(eq(users.id, ctx.user.id));

        return { success: true };
      } catch (error) {
        console.error("Failed to upload photo:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload photo. Please try again.",
        });
      }
    }),

  getAvatarUrl: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.query.users.findFirst({
          columns: { avatar: true },
          where: eq(users.id, input),
        });

        if (!user?.avatar) {
          return null;
        }

        const presignedUrl = await ctx.minio.presignedGetObject(
          env.BUCKET_NAME,
          user.avatar,
          24 * 60 * 60, // 24 hours expiry
        );

        return presignedUrl;
      } catch (error) {
        console.error("Failed to generate avatar URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve avatar",
        });
      }
    }),
};
