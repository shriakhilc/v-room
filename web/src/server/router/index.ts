// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { classroomRouter } from "./classroom";
import { userRouter } from "./user";
import { questionRouter } from "./question";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('user.', userRouter)
  .merge("classroom.", classroomRouter)
  .merge("question.", questionRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
