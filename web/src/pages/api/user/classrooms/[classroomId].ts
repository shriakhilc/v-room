import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { UserRole } from "@prisma/client";

export async function getUsersForClassroom(classroomId: string) {
    const studentUsers = await prisma.user.findMany({
        where: {
            classrooms: {
                some: {
                    classroomId: classroomId as string,
                    role: UserRole.STUDENT
                }
            }
        }
    });
    const assistantUsers = await prisma.user.findMany({
        where: {
            classrooms: {
                some: {
                    classroomId: classroomId as string,
                    role: UserRole.ASSISTANT
                }
            }
        }
    });
    const instructorUsers = await prisma.user.findMany({
        where: {
            classrooms: {
                some: {
                    classroomId: classroomId as string,
                    role: UserRole.ASSISTANT
                }
            }
        }
    });
    return {studentUsers: studentUsers, 
            assistantUsers: assistantUsers, 
            instructorUsers: instructorUsers};
}


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const classroomId  = req.query?.classroomId;
        if(classroomId) {
            const users = await getUsersForClassroom(classroomId as string);
            res.status(200).json({ 
                studentUsers: users.studentUsers,
                assistantUsers: users.assistantUsers,
                instructorUsers: users.instructorUsers
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

