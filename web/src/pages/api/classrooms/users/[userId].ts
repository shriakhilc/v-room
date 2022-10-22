import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";

const getClassroomsForUser = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const userId  = req.query?.userId;
        if(userId) {
            const studentClassrooms = await prisma.classroom.findMany({
                where: {
                    students: {
                        some: {
                            user: {
                                id: userId as string,
                            }
                        }
                    }
                }
            });
            const assistantClassrooms = await prisma.classroom.findMany({
                where: {
                    assistants: {
                        some: {
                            user: {
                                id: userId as string,
                            }
                        }
                    }
                }
            });
            const instructorClassrooms = await prisma.classroom.findMany({
                where: {
                    instructors: {
                        some: {
                            user: {
                                id: userId as string,
                            }
                        }
                    }
                }
            });
            res.status(200).json({ 
                studentClassrooms: studentClassrooms,
                assistantClassrooms: assistantClassrooms,
                instructorClassrooms: instructorClassrooms
            });
        }
        else {
            res.status(404).json({});
        }
    } catch(e) {
        res.status(500).json({error: e});
    }
}

export default getClassroomsForUser;

