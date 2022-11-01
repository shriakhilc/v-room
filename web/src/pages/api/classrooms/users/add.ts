import { NotFoundError } from "@prisma/client/runtime";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { UserRole } from "@prisma/client";

export async function addUserToClassroom(userId: string, classroomId: string, role: string) {
    console.log(userId);
    console.log(classroomId);
    console.log(role);
    if(role == 'student') {
        const result = await prisma.userOnClassroom.create({
            data: {
                userId: userId,
                classroomId: classroomId,
                role: UserRole.STUDENT
            }
        });
        return result;
    }
    else if(role == 'assistant') {
        const result = await prisma.userOnClassroom.create({
            data: {
                userId: userId,
                classroomId: classroomId,
                role: UserRole.ASSISTANT
            }
        });
        return result;
    }
    else if(role == 'instructor') {
        const result = await prisma.userOnClassroom.create({
            data: {
                userId: userId,
                classroomId: classroomId,
                role: UserRole.INSTRUCTOR
            }
        });
        return result;
    }
    else {
        console.log(role);
        throw NotFoundError;
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method == 'POST') {
        try {
            const result = await addUserToClassroom(req.body.userId, req.body.classroomId, req.body.role);
            res.status(200).json({result});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}

export default handler;

