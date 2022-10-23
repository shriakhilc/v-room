import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function updateUser(email: any,data: any) {
    const result = await prisma.user.update({
        where: {
          email:email
        },
        data});
    return result;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log("55555555555");
    if(typeof req.body=="string")
    {
        req.body=JSON.parse(req.body);
    }

    console.log('wwwvvvv ',req.body);
    if(req.method == 'PUT') {
        try {
            const result = await updateUser(req.body.email,req.body.data);
            console.log('222222 ',result);
            res.status(200).json({result});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}

export default handler;

