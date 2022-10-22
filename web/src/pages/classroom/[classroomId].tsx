import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Header from "../../components/header"
import Footer from "../../components/footer"
import type { Classroom, User } from '@prisma/client';
import React from "react";
import UserTable from "@/src/components/userTable";
import { getAllUsers } from "../api/users";
import { useRouter } from 'next/router';
import { getClassroom } from "../api/classrooms/[classroomId]";
import { getUsersForClassroom } from "../api/users/classrooms/[classroomId]";

type PageProps = {
  allUsersSectioned: User[],
  userRoles: string[],
  classroom: Classroom
}

const ClassroomDetail: NextPage<PageProps> = ({ allUsersSectioned, userRoles, classroom }) => {
  const router = useRouter();

  return (
    <>
      <div className="container mx-auto">
        <Head>
          <title>V-Room</title>
          <meta name="description" content="Reimagining Office Hours" />
          <link rel="icon" href="/favicon.svg" />
        </Head>

        <Header></Header>

        <main className="container mx-auto h-5/6 flex flex-col items-left p-4">
          <h1 className="text-lg leading-normal p-4">
            <span className="text-red-500">Users for </span>
          </h1>
          <UserTable router={router} users={allUsersSectioned} userRoles={userRoles} classroom={classroom}></UserTable>
        </main>


        <Footer></Footer>
      </div>
    </>
  );
};

export async function getServerSideProps(context:GetServerSidePropsContext) {
  const allUsers = await getAllUsers();
  const classroomId = context.query.classroomId;
  if(typeof classroomId === 'string') {
    const classroom = await getClassroom(classroomId as string);
    const splitUsers = await getUsersForClassroom(classroomId as string);
    const enrolledUsers = 
      splitUsers.studentUsers.concat(splitUsers.assistantUsers.concat(splitUsers.instructorUsers));
    const unenrolledUsers = allUsers.filter(user1 => 
      !enrolledUsers.map(user2=>user2.id).includes(user1.id)
    );
    const userRoles:string[] = [];
    splitUsers.studentUsers.forEach((element) => {
      userRoles.push("Student");
    });
    splitUsers.assistantUsers.forEach((element) => {
      userRoles.push("Assistant");
    });
    splitUsers.instructorUsers.forEach((element) => {
      userRoles.push("Instructor");
    });
    unenrolledUsers.forEach((element) => {
      userRoles.push("None");
    });
    const allUsersSectioned = enrolledUsers.concat(unenrolledUsers);
    return { props: { allUsersSectioned, userRoles, classroom }};
  }
  else {
    const classroom = null;
    const enrolledUsers = null;
    return { props: { allUsers, classroom, enrolledUsers}};
  }

}

export default ClassroomDetail;