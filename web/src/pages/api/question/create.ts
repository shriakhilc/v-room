import { NextApiRequest,NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function createQuestion(questionTitle:string,questionStr:any, classroomId:any, userId: any) {
        const result = await prisma.question.create({data:{
            questionTitle,
            questionStr: questionStr,
            classroomId: classroomId,
            userId: userId,
            createdAt:new Date(),
            updatedAt:new Date()
        }
    });
        return result;
   
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method == 'POST') {
        try {
            if(typeof req.body=="string")
            {
                req.body=JSON.parse(req.body);
            }
            const result = await createQuestion(req.body.questionTitle,req.body.questionStr, req.body.classroomId, req.body.userId);
            res.status(200).json({result});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}
export default handler;