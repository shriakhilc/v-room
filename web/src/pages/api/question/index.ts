import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function getAllQuestions(userId?: string) {
    let result;
    if(userId)
    {
        result = await prisma.question.findMany(
            {
                where: {
                  userId: userId
                },
                orderBy: {
                    updatedAt: 'desc'
                },
                include:{
                    answer:true
                }
            }
        );
    }
    else{
        result =await prisma.question.findMany(
            {
                orderBy: {
                    updatedAt: 'desc'
                },
                include:{
                    answer:true
                }
            }
        );
    }
   
    return result;
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
    if(req.method == 'GET') {
        try {
            let questions;
            console.log("1111111111")
            if(req.body.userId)
            {
                questions = await getAllQuestions(req.body.userId);
               
            }
            else{
                questions = await getAllQuestions();
            }
            res.status(200).json({questions});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}


