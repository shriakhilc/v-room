import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function getAnswerById(answerId: string) {
    const result = await prisma.answer.findUnique({
        where: {
            answerId: answerId
        }
    });
    return result;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const answerId  = req.query?.answerId;
        if(answerId) {
            const result = await getAnswerById(answerId as string);
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


