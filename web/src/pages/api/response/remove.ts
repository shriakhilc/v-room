import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function deleteResponse(responseId: string) {
    const result = await prisma.response.delete({
        where: {
            responseId
        }
    });
    return result;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (typeof req.body == "string") {
        req.body = JSON.parse(req.body);
    }

    if (req.method == 'DELETE') {
        try {
            const result = await deleteResponse(req.body.responseId);
            res.status(200).json({ result });
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }
}

export default handler;

