import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function getAllClassrooms() {
    const result = await prisma.classroom.findMany();
    return result;
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
    try {
        const classrooms = await getAllClassrooms();
        res.status(200).json({classrooms});
    } catch(e) {
        res.status(500).json({error: e});
    }
}


