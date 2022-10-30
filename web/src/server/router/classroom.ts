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
const defaultClassroomSelect = Prisma.validator<Prisma.ClassroomSelect>()({
    id: true,
    name: true,
    department: true,
    courseNumber: true,
    crn: true,
    users: true,
    meetings: true,
    inviteCode: true,
    active: true,
});

const defaultUserOnClassroomSelect = Prisma.validator<Prisma.UserOnClassroomSelect>()({
    userId: true,
    classroomId: true,
    role: true,
});

// Endpoints that do not need to authenticate user
const publicRoutes = createRouter()
    .query('all', {
        async resolve() {
            /**
             * For pagination you can have a look at this docs site
             * @link https://trpc.io/docs/useInfiniteQuery
             */

            return prisma.classroom.findMany({
                select: defaultClassroomSelect,
            });
        },
    })
    .query('byId', {
        input: z.object({
            id: z.string().cuid(),
        }),
        async resolve({ input }) {
            const { id } = input;
            const classroom = await prisma.classroom.findUnique({
                where: { id },
                select: defaultClassroomSelect,
            });
            if (!classroom) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No classroom with id '${id}'`,
                });
            }
            return classroom;
        },
    })
    .query('enrolledUsers', {
        input: z.object({
            id: z.string().cuid(),
        }),
        async resolve({ input }) {
            const result = await prisma.userOnClassroom.findMany({
                where: { classroomId: input.id },
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                    role: true,
                },
            });
            return result;
        },
    })
    .query('unenrolledUsers', {
        input: z.object({
            id: z.string().cuid(),
        }),
        async resolve({ input }) {
            const result = await prisma.user.findMany({
                where: { classrooms: { none: { classroomId: input.id } } },
                select: { id: true, name: true, email: true },
            });
            return result;
        },
    })
    // TODO: ideally use above APIs to split up the calls after UI improvements
    // maybe not show all unenrolled users in table, and only use them for auto-completion.
    .query('sectionedUsers', {
        input: z.object({
            classroomId: z.string().cuid(),
        }),
        async resolve({ input }) {
            const enrolled = await prisma.userOnClassroom.findMany({
                where: { classroomId: input.classroomId },
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                    role: true,
                },
            });

            const unenrolled = await prisma.user.findMany({
                where: {
                    classrooms: {
                        none: {
                            classroomId: input.classroomId
                        }
                    }
                },
                select: { id: true, name: true, email: true, },
            });

            return {
                enrolled: enrolled,
                unenrolled: unenrolled,
            };
        },
    });

// Endpoints that need to authenticate user
// ctx.session and ctx.session.user are already validated to be non-null
const authRoutes = createProtectedRouter()
    .mutation('add', {
        input: z.object({
            name: z.string(),
            department: z.string(),
            courseNumber: z.number(),
            crn: z.number(),
        }),
        async resolve({ input }) {
            const classroom = await prisma.classroom.create({
                data: input,
                select: defaultClassroomSelect,
            });
            return classroom;
        },
    })
    .mutation('addUser', {
        input: z.object({
            userId: z.string().cuid(),
            classroomId: z.string().cuid(),
            role: z.nativeEnum(UserRole)
        }),
        async resolve({ input, ctx }) {
            const userMatch = await prisma.userOnClassroom.findUnique({
                where: {
                    userId_classroomId: {
                        userId: ctx.session.user.id,
                        classroomId: input.classroomId,
                    },
                },
                select: { role: true }
            });

            if (userMatch != null &&
                (
                    userMatch.role == UserRole.INSTRUCTOR ||
                    userMatch.role == UserRole.ASSISTANT
                )
            ) {
                const userOnClassroom = await prisma.userOnClassroom.create({
                    data: input,
                    select: defaultUserOnClassroomSelect,
                });
                return userOnClassroom;
            }
            else {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `User ${ctx.session.user.email} is not authorized to add users to classroom '${input.classroomId}'`
                });
            }
        },
    })
    .mutation('removeUser', {
        input: z.object({
            userId: z.string().cuid(),
            classroomId: z.string().cuid(),
        }),
        async resolve({ input, ctx }) {
            const userMatch = await prisma.userOnClassroom.findUnique({
                where: {
                    userId_classroomId: {
                        userId: ctx.session.user.id,
                        classroomId: input.classroomId,
                    },
                },
                select: { role: true }
            });

            if (userMatch != null &&
                (
                    userMatch.role == UserRole.INSTRUCTOR ||
                    userMatch.role == UserRole.ASSISTANT
                )
            ) {
                const userOnClassroom = await prisma.userOnClassroom.delete({
                    where: {
                        userId_classroomId: input,
                    },
                    select: defaultUserOnClassroomSelect,
                });
                return userOnClassroom;
            }
            else {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `User ${ctx.session.user.email} is not authorized to add users to classroom '${input.classroomId}'`
                });
            }
        },
    })
    .mutation('archive', {
        input: z.object({
            id: z.string().cuid(),
        }),
        async resolve({ input, ctx }) {
            const userMatch = await prisma.userOnClassroom.findUnique({
                where: {
                    userId_classroomId: {
                        userId: ctx.session.user.id,
                        classroomId: input.id,
                    },
                },
                select: { role: true }
            });

            if (userMatch != null && userMatch.role == UserRole.INSTRUCTOR) {
                const classroom = await prisma.classroom.update({
                    where: input,
                    data: { active: false },
                    select: defaultClassroomSelect,
                });
                return classroom;
            }
            else {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `User ${ctx.session.user.email} is not authorized to archive classroom with id '${input.id}'`
                });
            }
        },
    })
    .mutation('delete', {
        input: z.object({
            id: z.string().cuid(),
        }),
        async resolve({ input, ctx }) {
            const { id } = input;
            const user = ctx.session.user;

            const userMatch = await prisma.userOnClassroom.findUnique({
                where: {
                    userId_classroomId: {
                        userId: user.id,
                        classroomId: id,
                    },
                },
                select: { role: true }
            });

            if (userMatch != null && userMatch.role == UserRole.INSTRUCTOR) {
                await prisma.classroom.delete({ where: { id } });
                return {
                    id,
                };
            }
            else {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `User ${user.email} is not authorized to delete classroom with id '${id}'`
                });
            }
        },
    });

// Combine all routes for this model
export const classroomRouter = publicRoutes.merge(authRoutes);