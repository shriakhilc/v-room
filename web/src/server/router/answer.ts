import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '../db/client';
import { createProtectedRouter, createRouter } from "./context";

/**
 * Default selector for model
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 * 
 */

const defaultAnswerSelect = Prisma.validator<Prisma.AnswerSelect>()({
    answerId: true,
    answerStr: true,
    questionId: true,
    user: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    likes: true,
    parent_id: true
});

// Endpoints that do not need to authenticate user
const publicRoutes = createRouter()
    .query('byId', {
        input: z.object({
            answerId: z.string().cuid(),
        }),
        async resolve({ input }) {
            const { answerId } = input;
            // const answer = await prisma.answer.findUnique({
            //     where: { answerId },
            //     select: defaultAnswerSelect,
            // });
            const result = await prisma.answer.findUnique({
                where: {
                    answerId: answerId
                },
                include: {
                    likes: true,
                    user: true,
                    question:
                    {
                        include:
                        {
                            classroom: true,
                        }
                    },
                    Children: {
                        include: {
                            likes: true,
                            user: true
                        }
                    }
                },

            });

            if (!result) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No answer with id '${answerId}'`,
                });
            }
            
            return result;
        },
    })
    .query('nestedAnswers', {
        input: z.object({
            answerId: z.string().cuid(),
        }),
        async resolve({ input }) {
            const { answerId } = input;
            const nestedAnswers = await prisma.answer.findMany({
                where: { parent_id: answerId },
                include: {
                    likes: true,
                    user: true
                }
            });
            if (!nestedAnswers) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No replies for id '${answerId}'`,
                });
            }
            return nestedAnswers;
        },
    });


// Endpoints that need to authenticate user
// ctx.session and ctx.session.user are already validated to be non-null
const authRoutes = createProtectedRouter()
    .mutation('addToQuestion', {
        input: z.object({
            answerStr: z.string(),
            questionId: z.string().cuid(),
            userId: z.string().cuid(),
            parent_id: z.string().cuid()
        }),
        async resolve({ input }) {
            const answer = await prisma.answer.create({
                data: {
                    answerStr: input.answerStr,
                    questionId: input.questionId,
                    userId: input.userId,
                    parent_id:input.parent_id,
                    createdAt:new Date(),
                    updatedAt:new Date()
                },
                select: defaultAnswerSelect,
            });

            return answer;
        },
        }) 
        .mutation('addToAnswer', {
        input: z.object({
            answerStr: z.string(),
            userId: z.string().cuid(),
            parent_id: z.string().cuid(),
        }),
        async resolve({ input }) {
            const answer = await prisma.answer.create({
                data: {
                    answerStr: input.answerStr,
                    userId: input.userId,
                    parent_id:input.parent_id,
                    createdAt:new Date(),
                    updatedAt:new Date()
                },
                select: defaultAnswerSelect,
            });

            return answer;
        },
    })
    .mutation('delete', {
        input: z.object({
            answerId: z.string().cuid(),
        }),
        async resolve({ input, ctx }) {
            const answer = await prisma.answer.delete({
                where: {
                    answerId: input.answerId,
                },
                select: defaultAnswerSelect,
            });
            if (answer != null) {
                return answer;
            }
            else {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `User ${ctx.session.user.email} is not authorized to delete this answer'`
                });
            }
        },
    })
    .mutation('update', {
        input: z.object({
            answerId: z.string().cuid(),
            answerStr: z.string(),
        }),
        async resolve({ input, ctx }) {
            const answer = await prisma.answer.update({
                where: {
                    answerId: input.answerId
                },
                data: {
                    answerStr: input.answerStr,
                },
                select: defaultAnswerSelect,
            });
            if (answer) {
                return answer;
            }


            else {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `User ${ctx.session.user.email} is not authorized to update this answer'`
                });
            }
        },
    });

// Combine all routes for this model
export const answerRouter = publicRoutes.merge(authRoutes);

