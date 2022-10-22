import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";

export async function getUsersForClassroom(classroomId: string) {
    const studentUsers = await prisma.user.findMany({
        where: {
            classroomsAsStudent: {
                some: {
                    classroom: {
                        id: classroomId as string,
                    }
                }
            }
        }
    });
    const assistantUsers = await prisma.user.findMany({
        where: {
            classroomsAsAssistant: {
                some: {
                    classroom: {
                        id: classroomId as string,
                    }
                }
            }
        }
    });
    const instructorUsers = await prisma.user.findMany({
        where: {
            classroomsAsInstructor: {
                some: {
                    classroom: {
                        id: classroomId as string,
                    }
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

