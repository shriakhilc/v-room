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
            answer: true, // Return all fields
          },
    });
    const answerResult = await prisma.answer.findMany({
        where: {
            answerStr: {
              search: searchStr,
            },
          },
    });
    return {questions:questionResult,answers:answerResult};
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


