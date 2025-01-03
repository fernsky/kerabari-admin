import { partRouter } from "./routers/part/part.procedure";
import { chapterRouter } from "./routers/chapter/chapter.procedure";
import { sectionRouter } from "./routers/section/section.procedure";
import { paragraphRouter } from "./routers/paragraph/paragraph.procedure";
import { tableRouter } from "./routers/table/table.procedure";
import { userRouter } from "./routers/user/user.procedure";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  part: partRouter,
  chapter: chapterRouter,
  section: sectionRouter,
  paragraph: paragraphRouter,
  table: tableRouter,
});

export type AppRouter = typeof appRouter;
