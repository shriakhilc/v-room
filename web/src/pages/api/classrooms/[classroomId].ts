import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function getClassroom(classroomId: string) {
    const result = await prisma.classroom.findUnique({
        where: {
            id: classroomId
        }
    });
    return result;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const classroomId  = req.query?.classroomId;
        if(classroomId) {
            const result = await getClassroom(classroomId as string);
            res.status(200).json({result});
        }
        else {
            res.status(404).json({});
        }
    } catch(e) {
        res.status(500).json({error: e});
    }
}

export default handler;

