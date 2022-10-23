import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";

export async function getClassroomsForUser(userId: string) {
    const studentClassrooms = await prisma.classroom.findMany({
        where: {
            students: {
                some: {
                    user: {
                        id: userId,
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
                        id: userId,
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
                        id: userId,
                    }
                }
            }
        }
    });
    return {studentClassrooms: studentClassrooms, assistantClassrooms: assistantClassrooms, instructorClassrooms: instructorClassrooms};
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const userId  = req.query?.userId;
        if(userId) {
            const classroomSet = await getClassroomsForUser(userId as string);
            res.status(200).json({ 
                studentClassrooms: classroomSet.studentClassrooms,
                assistantClassrooms: classroomSet.assistantClassrooms,
                instructorClassrooms: classroomSet.instructorClassrooms
            });
        }
        else {
            res.status(404).json({});
        }
    } catch(e) {
        res.status(500).json({error: e});
    }
}

export default handler;

