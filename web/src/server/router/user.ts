import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '../db/client';
import { createRouter } from "./context";

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
    });

// Endpoints that need to authenticate current user
// ctx.session and ctx.session.user are already validated to be non-null
// const authRoutes = createProtectedRouter();

// Combine all routes for this model
export const userRouter = publicRoutes;