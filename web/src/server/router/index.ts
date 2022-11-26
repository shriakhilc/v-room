// src/server/router/index.ts
import superjson from "superjson";
import { answerRouter } from "./answer";
import { classroomRouter } from "./classroom";
import { createRouter } from "./context";
import { meetingRouter } from "./meeting";
import { questionRouter } from "./question";
import { userRouter } from "./user";
import { userOnClassroomRouter } from "./userOnClassroom";
import { voteAnswerRouter } from "./voteAnswer";
import { voteQuestionRouter } from "./voteQuestion";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('user.', userRouter)
  .merge("classroom.", classroomRouter)
  .merge("question.", questionRouter)
  .merge("answer.", answerRouter)
  .merge("userOnClassroom.", userOnClassroomRouter)
  .merge('meeting.', meetingRouter)
  .merge('likeQuestion.', voteQuestionRouter)
  .merge('likeAnswer.', voteAnswerRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
