import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db/client";

export async function addMeetingToClassroom(meetingId: string, classroomId: string) {
    const result = await prisma.classroom.update({
        where: {
            id: classroomId
        },
        data: {
            meetings: meetingId + ","
        }
    });
    return result;
}
export async function removeMeetingFromClassroom(userId: string, classroomId: string) {
    //TODO
    const result = await prisma.classroom.update({
        where: {
            id: classroomId
        },
        data: {
            meetings: ""
        }
    });
    return result;
}
export async function getMeetingsForClassroom(classroomId: string) {
    const result = await prisma.classroom.findFirst({
        where: {
            id: classroomId
        }
    });
    return result?.meetings.split(",");
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.body.get) {
            const result = await getMeetingsForClassroom(req.body.classroomId);
            res.status(200).json(result);
        } else {
            if (req.body.add) {
                const result = await addMeetingToClassroom(req.body.meetingId, req.body.classroomId);
                res.status(200).json({ result });
            } else {
                const result = await removeMeetingFromClassroom(req.body.userId, req.body.classroomId);
                res.status(200).json({ result });
            }
        }
    } catch (e) {
        res.status(500).json({ error: e });
    }
}

export default handler;