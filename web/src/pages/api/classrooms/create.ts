import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

const createClassroom = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const result = await prisma.classroom.create({data:{}});
        res.status(200).json({result});
    } catch(e) {
        res.status(500).json({error: e});
    }
}

export default createClassroom;

