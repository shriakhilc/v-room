import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";

export async function getSearchResults(searchStr: string) {
    const questionResult = await prisma.question.findMany({
        where: {
          questionStr: {
            search: searchStr,
          },
        },
        include: {
            response: true, // Return all fields
          },
    });
    const responseResult = await prisma.response.findMany({
        where: {
            responseStr: {
              search: searchStr,
            },
          },
    });
    return {questions:questionResult,answers:responseResult};
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const searchStr  = req.query?.searchStr;
        const result = await getSearchResults(searchStr as string);
        res.status(200).json({result});
        
    } catch(e) {
        res.status(500).json({error: e});
    }
}

export default handler;


