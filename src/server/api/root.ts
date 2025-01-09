import { adminRouter } from "./routers/admin/admin.procedure";
import { wardRouter } from "./routers/ward/ward.procedure";
import { userRouter } from "./routers/user/user.procedure";
import { createTRPCRouter } from "./trpc";
import { areaRouter } from "./routers/areas/areas.procedure";
import { superadminRouter } from "./routers/superadmin/superadmin.procedure";

export const appRouter = createTRPCRouter({
  user: userRouter,
  admin: adminRouter,
  area: areaRouter,
  ward: wardRouter,
  superadmin: superadminRouter,
});

export type AppRouter = typeof appRouter;
