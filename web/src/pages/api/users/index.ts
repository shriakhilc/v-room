import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function getAllUsers() {
    const result = await prisma.user.findMany();
    return result;
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
    if(req.method == 'GET') {
        try {
            const users = await getAllUsers();
            res.status(200).json({users});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}


