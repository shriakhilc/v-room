import { NotFoundError } from "@prisma/client/runtime";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function removeClassroom(classroomId: string, userId: string, archive: boolean) {
    // TODO: Look into using nextAuth session here instead of passing userId param https://next-auth.js.org/getting-started/example#backend---api-route
    // TODO: Raise custom exception for unauthorized?
    // Ensures user has the authority to perform this operation
    await prisma.instructorsOnClassrooms.findUniqueOrThrow({
        where: {
            userId_classroomId: {
                userId: userId,
                classroomId: classroomId,
            },
        },
    });

    if (archive) {
        const result = await prisma.classroom.update({
            where: { id: classroomId },
            data: { active: false },
        });
        return result;
    }
    else {
        const result = await prisma.classroom.delete({
            where: {
                id: classroomId,
            },
        });
        return result;
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method == 'POST') {
        try {
            const result = await removeClassroom(req.body.classroomId, req.body.userId, req.body.archive);
            res.status(200).json({ result });
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }
}

export default handler;