import { Prisma, UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '../db/client';
import { createProtectedRouter, createRouter } from "./context";

// Endpoints that do not need to authenticate user
const publicRoutes = createRouter()
    .query('getForClassroom', {
        input: z.object({
            classroomId: z.string().cuid(),
        }),
        async resolve({ input }) {
            const result = await prisma.classroom.findUnique({
                where: {
                    id: input.classroomId,
                },
                select: { meetings: true },
            });
            return result?.meetings.split(",");
        },
    })
    .mutation('addToClassroom', {
        input: z.object({
            classroomId: z.string().cuid(),
            meetingId: z.string(),
        }),
        async resolve({ input }) {
            // TODO: Append to string instead of overwriting? Will require using raw query
            const result = await prisma.classroom.update({
                where: {
                    id: input.classroomId,
                },
                data: { meetings: input.meetingId + "," },
                select: { meetings: true },
            });
            return result?.meetings.split(",");
        },
    })
    .mutation('removeFromClassroom', {
        input: z.object({
            classroomId: z.string().cuid(),
        }),
        async resolve({ input }) {
            // set as empty
            const result = await prisma.classroom.update({
                where: {
                    id: input.classroomId,
                },
                data: { meetings: "" },
                select: { meetings: true },
            });
            return result?.meetings.split(",");
        },
    })

// Endpoints that need to authenticate user
// ctx.session and ctx.session.user are already validated to be non-null
//const authRoutes = createProtectedRouter()

// Combine all routes for this model
export const meetingRouter = publicRoutes;