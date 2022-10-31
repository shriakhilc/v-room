import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

export async function createClassroom(name:string, department:string, courseNumber:number, crn: number) {
    try {
        
   
    const result = await prisma.classroom.create({data:{
        name: name,
        department: department,
        courseNumber: courseNumber,
        crn: crn
    }});
    return result;
} catch (error) {
        console.log("asdasdas" ,error);
}

}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method == 'POST') {
        try {
            console.log("qqqqq ",req.body);
            const result = await createClassroom(req.body.name, req.body.department, req.body.courseNumber, req.body.crn);
            res.status(200).json({result});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }
}

export default handler;

