import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function getResponseById(responseId: string) {
    const result = await prisma.response.findUnique({
        where: {
            responseId: responseId
        }
    });
    return result;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const responseId  = req.query?.responseId;
        if(responseId) {
            const result = await getResponseById(responseId as string);
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


