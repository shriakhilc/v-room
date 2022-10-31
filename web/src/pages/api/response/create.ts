import { NextApiRequest,NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function createResponse(responseStr:any, questionId:any, userId: any) {
        const result = await prisma.response.create({data:{
            responseStr,
            questionId,
            userId,
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
            const result = await createResponse(req.body.responseStr, req.body.questionId, req.body.userId);
            res.status(200).json({result});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}
export default handler;