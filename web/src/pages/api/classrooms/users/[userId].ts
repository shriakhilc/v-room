import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { UserRole } from "@prisma/client";

export async function getClassroomsForUser(userId: string) {
    const studentClassrooms = await prisma.classroom.findMany({
        where: {
            users: {
                some: {
                    userId: userId,
                    role: UserRole.STUDENT
                }
            }
        }
    });
    const assistantClassrooms = await prisma.classroom.findMany({
        where: {
            users: {
                some: {
                    userId: userId,
                    role: UserRole.ASSISTANT
                }
            }
        }
    });
    const instructorClassrooms = await prisma.classroom.findMany({
        where: {
            users: {
                some: {
                    userId: userId,
                    role: UserRole.INSTRUCTOR
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

