import { Prisma, UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '../db/client';
import { createProtectedRouter, createRouter } from "./context";

/**
 * Default selector for model
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultQuestionSelect = Prisma.validator<Prisma.QuestionSelect>()({
    questionId: true,
    questionTitle: true,
    questionStr: true,
    classroom: true,
    classroomId: true,
    user: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    answer: true,
    likes: true,
});


// Endpoints that do not need to authenticate user
const publicRoutes = createRouter()
    .query('all', {
        async resolve() {
            /**
             * For pagination you can have a look at this docs site
             * @link https://trpc.io/docs/useInfiniteQuery
             */

            return prisma.question.findMany({
                select: defaultQuestionSelect,
            });
        },
    })
    .query('byId', {
        input: z.object({
            questionId: z.string().cuid(),
        }),
        async resolve({ input }) {
            const { questionId } = input;
            const result = await prisma.question.findUnique({
                where: { questionId },
                include: {
                    classroom: true,
                    user: true,
                    answer: {
                        include: {
                            Children: {
                                include: {
                                    likes: true,
                                    user: true
                                }
                            }, 
                            user: true,
                            likes: true
                        }
                    },
                    likes:true
                },
            });
            if (!result) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No question with id '${questionId}'`,
                });
            }
            return result;
        },
    })
    .query('byClassroom', {
        input: z.object({
            classroomId: z.string().cuid(),
        }),
        async resolve({ input }) {
            const { classroomId } = input;
            const result = await prisma.question.findMany(
                {
                    orderBy: {
                        updatedAt: 'desc'
                    },
                    include: {
                        answer:
                        {
                            include: {
                                Children: {
                                    include: {
                                        likes: true,
                                        user: true
                                    }
                                },
                                likes: true,
                                user: true
                            },
                        },
                        likes: true,
                        classroom: true,
                        user: true
                    },
                    where: {
                        classroomId: classroomId
                    }
                }
            );
            if (!result) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No question with id '${classroomId}'`,
                });
            }
            return result;
        },
    })
    .query('bySearchStr', {
        input: z.object({
            searchStr: z.string(),
            //not sure if can make optional
            classroomId: z.string().cuid().nullable(),
            userId: z.string().cuid().nullable(),
        }),
        async resolve({ input }) {
            const { searchStr } = input;
            let questionResult, answerResult;
            if (!input.classroomId && !input.userId) {
                questionResult = await prisma.question.findMany({
                    where: {
                        questionStr: {
                            search: searchStr,
                        },
                        questionTitle: {
                            search: searchStr,
                        }
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    },
                    include: {
                        likes: true,
                        user: true,
                        classroom: true,
                        answer:
                        {
                            include: {
                                Children: {
                                    include: {
                                        likes: true,
                                        user: true
                                    }
                                },
                                likes: true,
                                user: true
                            },
                        },

                    },
                });

                answerResult = await prisma.answer.findMany({
                    where: {
                        answerStr: {
                            search: searchStr,
                        },
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
                        }
                    }
                });
                return { questions: questionResult, answers: answerResult };
            }
            else if (input.classroomId && !input.userId) {
                questionResult = await prisma.question.findMany({
                    where: {
                        classroomId: input.classroomId,
                        questionStr: {
                            search: searchStr,
                        },
                        questionTitle: {
                            search: searchStr,
                        }
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    },
                    include: {
                        likes: true,
                        user: true,
                        classroom: true,
                        answer:
                        {
                            include: {
                                Children: {
                                    include: {
                                        likes: true,
                                        user: true
                                    }
                                },
                                likes: true,
                                user: true
                            },
                        },

                    },
                });

                answerResult = await prisma.answer.findMany({
                    where: {
                        answerStr: {
                            search: searchStr,
                        },
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
                        }
                    }
                });
                
                return { questions: questionResult, answers: answerResult };
            }

            else if (input.userId && !input.classroomId) {
                questionResult = await prisma.question.findMany({
                    where: {
                        userId: input.userId,
                        questionStr: {
                            search: searchStr,
                        },
                        questionTitle: {
                            search: searchStr,
                        }
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    },
                    include: {
                        likes: true,
                        user: true,
                        classroom: true,
                        answer:
                        {
                            include: {
                                Children: {
                                    include: {
                                        likes: true,
                                        user: true
                                    }
                                },
                                likes: true,
                                user: true
                            },
                        },

                    },
                });
                answerResult = await prisma.answer.findMany({
                    where: {
                        answerStr: {
                            search: searchStr,
                        },
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
                        }
                    }
                });
                return { questions: questionResult, answers: answerResult };
            }

            else {
                questionResult = await prisma.question.findMany({
                    where: {
                        userId: input.userId as string,
                        classroomId: input.classroomId as string,
                        questionStr: {
                            search: searchStr,
                        },
                        questionTitle: {
                            search: searchStr,
                        }
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    },
                    include: {
                        likes: true,
                        user: true,
                        classroom: true,
                        answer:
                        {
                            include: {
                                Children: {
                                    include: {
                                        likes: true,
                                        user: true
                                    }
                                },
                                likes: true,
                                user: true
                            },
                        },

                    },
                });
                answerResult = await prisma.answer.findMany({
                    where: {
                        answerStr: {
                            search: searchStr,
                        },
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
                        }
                    }
                });
               
                return { questions: questionResult, answers: answerResult };
            }
        },
    });

// Endpoints that need to authenticate user
// ctx.session and ctx.session.user are already validated to be non-null
const authRoutes = createProtectedRouter()
    .mutation('add', {
        input: z.object({
            questionTitle: z.string(),
            questionStr: z.string(),
            classroomId: z.string().cuid(),
            userId: z.string().cuid(),
        }),
        async resolve({ input }) {
            const question = await prisma.question.create({
                data: {
                    questionTitle: input.questionTitle,
                    questionStr: input.questionStr,
                    classroomId: input.classroomId,
                    userId: input.userId,
                },
                select: defaultQuestionSelect,
            });

            return question;
        },
    })
    .mutation('delete', {
        input: z.object({
            questionId: z.string().cuid(),
        }),
        async resolve({ input, ctx }) {
            const questionMatch = await prisma.question.findUnique({
                where: {
                    questionId: input.questionId,
                },
                select: defaultQuestionSelect,
            });
            if ((questionMatch != null)) {
                const userOnClassroomMatch = await prisma.userOnClassroom.findUnique({
                    where: {
                        userId_classroomId: {
                            userId: ctx.session.user.id,
                            classroomId: questionMatch.classroomId,
                        },
                    },
                    select: { role: true }
                });
                if (userOnClassroomMatch != null && (questionMatch.userId == ctx.session.user.id || userOnClassroomMatch.role == UserRole.INSTRUCTOR)) {
                    const question = await prisma.question.delete({
                        where: {
                            questionId: input.questionId
                        },
                        select: defaultQuestionSelect,
                    });
                    return question;
                }
            }
            else {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `User ${ctx.session.user.email} is not authorized to delete this question'`
                });
            }
        },
    })
    .mutation('update', {
        input: z.object({
            questionId: z.string().cuid(),
            questionTitle: z.string(),
            questionStr: z.string(),
        }),
        async resolve({ input, ctx }) {
            const questionMatch = await prisma.question.findUnique({
                where: {
                    questionId: input.questionId,
                },
                select: defaultQuestionSelect,
            });
            if ((questionMatch != null)) {
                const userOnClassroomMatch = await prisma.userOnClassroom.findUnique({
                    where: {
                        userId_classroomId: {
                            userId: ctx.session.user.id,
                            classroomId: questionMatch.classroomId,
                        },
                    },
                    select: { role: true }
                });
                if (userOnClassroomMatch != null && questionMatch.userId == ctx.session.user.id) {
                    const question = await prisma.question.update({
                        where: {
                            questionId: input.questionId
                        },
                        data: {
                            questionTitle: input.questionTitle,
                            questionStr: input.questionStr,
                        },
                        select: defaultQuestionSelect,
                    });
                    return question;
                }
            }
            else {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `User ${ctx.session.user.email} is not authorized to update this question'`
                });
            }
        },
    });

// Combine all routes for this model
export const questionRouter = publicRoutes.merge(authRoutes);