import { adminRouter } from "./routers/admin/admin.procedure";
import { wardRouter } from "./routers/ward/ward.procedure";
import { userRouter } from "./routers/user/user.procedure";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  admin: adminRouter,
  ward: wardRouter,
});

export type AppRouter = typeof appRouter;
