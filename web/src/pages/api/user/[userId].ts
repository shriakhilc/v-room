import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function getUserByEmail(email: any) {
    const result = await prisma.user.findUnique( {where: {
        email,
      }},)
    return result;
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
    if(typeof req.query=="string")
    {
        req.query=JSON.parse(req.query);
    }
    if(req.method == 'GET') {
        try {
            const users = await getUserByEmail(req.query.userId);
            res.status(200).json({users});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}

