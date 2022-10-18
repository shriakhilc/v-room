import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const result = await prisma.classroom.findMany();
        res.status(200).json({result});
    } catch(e) {
        res.status(500).json({error: e});
    }
}

export default handler;

