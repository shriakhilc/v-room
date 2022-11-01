import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth/next";
import { prisma } from "../../../server/db/client";
import { NotFoundError } from "@prisma/client/runtime";
import { UserRole } from "@prisma/client";

export async function removeClassroom(classroomId: string, userId: string, archive: boolean) {
    // Ensures user has the authority to perform this operation
    console.log(`user=${userId}, class=${classroomId}, archive=${archive}`);

    const matchingUser = await prisma.userOnClassroom.findFirst({
        where: {
            userId: userId,
            classroomId: classroomId,
            role: UserRole.INSTRUCTOR
        },
    });

    if (matchingUser == null) {
        throw new NotFoundError("User is not authorized to perform this action");
    }

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
        const session = await unstable_getServerSession(req, res, authOptions);

        console.log(`api/classrooms/remove: session=${JSON.stringify(session)}`);

        if (session?.user?.id == null) {
            res.status(401).json({ message: "You must be logged in." });
            return;
        }

        try {
            const result = await removeClassroom(req.body.classroomId, session.user.id, req.body.archive);
            res.status(200).json({ result });
        } catch (e) {
            if (e instanceof NotFoundError) {
                res.status(403).json({ error: e });
            }
            else {
                res.status(500).json({ error: e });
            }
        }
    }
}

export default handler;