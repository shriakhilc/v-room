import { NotFoundError } from "@prisma/client/runtime";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";

export async function removeUserFromClassroom(classroomId: string, userId: string, role:string) {
    if(role == 'student') {
        console.log("role is student")
        const result = await prisma.userOnClassroom.delete({
            where: {
                userId_classroomId: {
                    userId: userId,
                    classroomId: classroomId,
                }
            },
        });
        return result;
    }
    else if(role == 'assistant') {
        console.log("role is assistant");
        const result = await prisma.userOnClassroom.delete({
            where: {
                userId_classroomId: {
                    userId: userId,
                    classroomId: classroomId,
                }
            },
        });
        return result;
    }
    else if(role == 'instructor') {
        console.log("role is instructor");
        const result = await prisma.userOnClassroom.delete({
            where: {
                userId_classroomId: {
                    userId: userId,
                    classroomId: classroomId,
                }
            },
        });
        return result;
    }
    else {
        throw NotFoundError;
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method == 'POST') {
        try {
            const result = await removeUserFromClassroom(req.body.classroomId, req.body.userId, req.body.role);
            res.status(200).json({result});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}

export default handler;

