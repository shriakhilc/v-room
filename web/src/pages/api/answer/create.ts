import { NextApiRequest,NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function createAnswer(answerStr:any, questionId:any, userId: any) {
    try {
        const result = await prisma.answer.create({data:{
            answerStr,
            questionId,
            userId,
            createdAt:new Date(),
            updatedAt:new Date()
        }
    });
        return result;
    } catch (error) {
        console.log("asdasad" ,error);
    }
       
   
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method == 'POST') {
        try {
            if(typeof req.body=="string")
            {
                req.body=JSON.parse(req.body);
            }
            const result = await createAnswer(req.body.answerStr, req.body.questionId, req.body.userId);
            res.status(200).json({result});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}
export default handler;