import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function getQuestionById(questionId: string) {
    const result = await prisma.question.findMany({
        where: {
            questionId
        },
        include: {
            answer: true, // Return all fields
        },
      })
    return result;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const questionId  = req.query?.questionId;
        if(questionId) {
            const result = await getQuestionById(questionId as string);
            res.status(200).json({result});
        }
        else {
            res.status(404).json({});
        }
    } catch(e) {
        res.status(500).json({error: e});
    }
}

export default handler;


