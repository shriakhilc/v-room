import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";

export async function getAllQuestionsInClassroom(classroomId?: string) {
    let result;
    result = await prisma.question.findMany(
        {
            where: {
                classroomId
            },
            orderBy: {
                updatedAt: 'desc'
            },
            include:{
                answer:true
            }
        }
    );
    
   
    return result;
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
    if(req.method == 'GET') {
        try {
            let questions;
            questions = await getAllQuestionsInClassroom(req.body.classroomId);
            res.status(200).json({questions});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}


