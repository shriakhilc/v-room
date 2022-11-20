import { LikeType, Prisma, UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '../db/client';
import { createProtectedRouter, createRouter } from "./context";

/**
 * Default selector for model
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */

const defaultLikeQuestionSelect = Prisma.validator<Prisma.LikeQuestionSelect>()({
    user:true,
    userId: true,
    question:true,
    questionId: true,
    likeType: true,
});

// Endpoints that need to authenticate user
// ctx.session and ctx.session.user are already validated to be non-null
const authRoutes = createProtectedRouter()
.mutation('voteQuestion', {
    input: z.object({
        questionId: z.string().cuid(),
        userId: z.string().cuid(),
        likeType: z.nativeEnum(LikeType),
    }),
    async resolve({ input, ctx }) {

        const result:any = await prisma.likeQuestion.create({data:{
            questionId:input.questionId,
            userId: ctx.session.user.id,
            likeType:input.likeType
        },
        select:defaultLikeQuestionSelect
    })
        return result;
        
}
} )

//removeVote: this is called if user has already liked or disliked a question, and 
//when the user tries to perform the same operation again, the vote is removed

.mutation('removeVote', { 
input: z.object({
    questionId: z.string().cuid(),
    userId: z.string().cuid(),
}),
async resolve({ input, ctx }) {

    const result = await prisma.likeQuestion.deleteMany({
        where: {
            questionId:input.questionId,
            userId: ctx.session.user.id,
        },
    });
    return result;
}
} )

//updateVote: this API is used if the user wants to change his vote from like/dislike to dislike/like

.mutation('updateVote', {
    input: z.object({
        questionId: z.string().cuid(),
        userId: z.string().cuid(),
        likeType: z.nativeEnum(LikeType),
    }),
    async resolve({ input, ctx }) {

        const result = await prisma.likeQuestion.update({
            where: {
                userId_questionId:{
                    questionId:input.questionId,
                    userId: ctx.session.user.id,
                }
            },
            data: {
                likeType:input.likeType
            },
            select:defaultLikeQuestionSelect
        });
        return result;
        
}
} )

// Combine all routes for this model
export const voteQuestionRouter = authRoutes;