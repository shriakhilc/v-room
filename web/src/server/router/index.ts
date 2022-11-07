// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { classroomRouter } from "./classroom";
import { userRouter } from "./user";
import { questionRouter } from "./question";
import { answerRouter } from "./answer";
import { userOnClassroomRouter } from "./userOnClassroom";
import { meetingRouter } from "./meeting";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('user.', userRouter)
  .merge("classroom.", classroomRouter)
  .merge("question.", questionRouter)
  .merge("answer.", answerRouter)
  .merge("userOnClassroom.", userOnClassroomRouter)
  .merge('meeting.', meetingRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
