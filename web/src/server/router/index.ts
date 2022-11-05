// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { classroomRouter } from "./classroom";
import { userRouter } from "./user";
import { questionRouter } from "./question";
import { answerRouter } from "./answer";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('user.', userRouter)
  .merge("classroom.", classroomRouter)
  .merge("question.", questionRouter)
  .merge("answer.",answerRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
