import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";

export async function addUserToClassroom(userId: string, classroomId: string, role: string) {
    if(role == 'student') {
        const result = await prisma.studentsOnClassrooms.create({
            data: {
                userId: userId,
                classroomId: classroomId,
            }
        });
        return result;
    }
    else if(role == 'assistant') {
        const result = await prisma.assistantsOnClassrooms.create({
            data: {
                userId: userId,
                classroomId: classroomId,
            }
        });
        return result;
    }
    else if(role == 'instructor') {
        const result = await prisma.instructorsOnClassrooms.create({
            data: {
                userId: userId,
                classroomId: classroomId,
            }
        });
        return result;
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method == 'POST') {
        try {
            const result = addUserToClassroom(req.body.userId, req.body.classroomId, req.body.role);
            res.status(200).json({result});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}

export default handler;

