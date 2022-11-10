import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '../db/client';
import { createProtectedRouter, createRouter } from "./context";

const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
    id: true,
    name: true,
    pronouns: true,
    email: true,
    image: true,
    classrooms: true,
});

// Endpoints that do not need to authenticate current user
const publicRoutes = createRouter()
    .query('all', {
        async resolve() {
            /**
             * For pagination you can have a look at this docs site
             * @link https://trpc.io/docs/useInfiniteQuery
             */

            return prisma.user.findMany({
                select: defaultUserSelect,
            });
        },
    })
    .query('byId', {
        input: z.object({
            id: z.string().cuid(),
        }),
        async resolve({ input }) {
            const { id } = input;
            const user = await prisma.user.findUnique({
                where: { id },
                select: defaultUserSelect,
            });

            if (user == null) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No user with id '${id}'`,
                });
            }
            return user;
        },
    })
    .query('getClassrooms', {
        input: z.object({
            id: z.string().cuid(),
        }),
        async resolve({ input }) {
            const results = await prisma.user.findUnique({
                where: { id: input.id },
                select: {
                    classrooms: {
                        select: {
                            classroom: true,
                            role: true
                        }
                    }
                }
            });

            if (results == null) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No user with id '${input.id}'`,
                });
            }

            return results.classrooms;
        },
    });



// Endpoints that need to authenticate current user
// ctx.session and ctx.session.user are already validated to be non-null
const authRoutes = createProtectedRouter()
    .mutation('update', {
        input: z.object({
            id: z.string().cuid(),
            data: z.object({
                name: z.string(),
                pronouns: z.string(),
            }),
        }),
        async resolve({ input, ctx }) {
            // User can only update own data
            if (ctx.session.user.id != input.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `User ${ctx.session.user.email} is not authorized to update User ${input.id}`
                });
            }

            await prisma.user.update({
                where: { id: input.id },
                data: input.data,
                select: { id: true },
            });
        },
    });

// Combine all routes for this model
export const userRouter = publicRoutes.merge(authRoutes);