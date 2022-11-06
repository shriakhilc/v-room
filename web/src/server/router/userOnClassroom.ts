import { Prisma, UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '../db/client';
import { createRouter, createProtectedRouter } from "./context";

const defaultUserOnClassroomSelect = Prisma.validator<Prisma.UserOnClassroomSelect>()({
    user: true,
    userId: true,
    classroom: true,
    classroomId: true,
    role: true,
});

// Endpoints that do not need to authenticate current user
const publicRoutes = createRouter()
    .query('all', {
        async resolve() {
            /**
             * For pagination you can have a look at this docs site
             * @link https://trpc.io/docs/useInfiniteQuery
             */

            return prisma.userOnClassroom.findMany({
                select: defaultUserOnClassroomSelect,
            });
        },
    })
    .query('byUserId', {
        input: z.object({
            userId: z.string().cuid(),
        }),
        async resolve({ input }) {
            const { userId } = input;
            const results = await prisma.userOnClassroom.findMany({
                where: { userId },
                select: defaultUserOnClassroomSelect,
            });

            if (results == null) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No relation with user id '${userId}'`,
                });
            }
            return results;
        },
    })
    .query('byClassroomId', {
        input: z.object({
            classroomId: z.string().cuid(),
        }),
        async resolve({ input }) {
            const results = await prisma.userOnClassroom.findMany({
                where: { classroomId: input.classroomId },
                select: defaultUserOnClassroomSelect,
            });

            if (results == null) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No relation with classroom id '${input.classroomId}'`,
                });
            }

            return results;
        },
    })
    .query('byClassroomAndUserId', {
        input: z.object({
            classroomId: z.string().cuid(),
            userId: z.string().cuid(),
        }),
        async resolve({ input }) {
            const results = await prisma.userOnClassroom.findFirst({
                where: { 
                    classroomId: input.classroomId,
                    userId: input.userId 
                },
                select: defaultUserOnClassroomSelect,
            });

            if (results == null) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No relation with classroom id '${input.classroomId}' and user id '${input.userId}'`,
                });
            }

            return results;
        },
    });



// Endpoints that need to authenticate current user
// ctx.session and ctx.session.user are already validated to be non-null
const authRoutes = createProtectedRouter()
    .mutation('delete', {
        input: z.object({
            userId: z.string().cuid(),
            classroomId: z.string().cuid(),
        }),
        async resolve({ input, ctx }) {

            await prisma.userOnClassroom.deleteMany({
                where: { 
                    userId: input.userId,
                    classroomId: input.classroomId 
                },
            });
        },
    })
    .mutation('create', {
        input: z.object({
            userId: z.string().cuid(),
            classroomId: z.string().cuid(),
            role: z.nativeEnum(UserRole),
        }),
        async resolve({ input, ctx }) {

            await prisma.userOnClassroom.create({
                data: { 
                    userId: input.userId,
                    classroomId: input.classroomId,
                    role: input.role,
                },
            });
        },
    });

// Combine all routes for this model
export const userOnClassroomRouter = publicRoutes.merge(authRoutes);