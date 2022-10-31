import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function updateAnswer(responseId: any, data: any) {
    const result = await prisma.response.update({
        where: {
            responseId
        },
        data: data
    });
    return result;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (typeof req.body == "string") {
        req.body = JSON.parse(req.body);
    }

    if (req.method == 'PUT') {
        try {
            const result = await updateAnswer(req.body.responseId, req.body.data);
            res.status(200).json({ result });
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }
}

export default handler;

