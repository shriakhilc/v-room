import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Header from "../../components/header"
import Footer from "../../components/footer"
import type { Classroom, User } from '@prisma/client';
import React from "react";
import UserTable from "@/src/components/userTable";
import { getAllUsers } from "../api/user";
import { useRouter } from 'next/router';
import { getClassroom } from "../api/classrooms/[classroomId]";
import { getUsersForClassroom } from "../api/user/classrooms/[classroomId]";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import ClassroomSettingsDropdown from "@/src/components/classroomSettingsDropdown";

type PageProps = {
  allUsersSectioned: User[],
  userRoles: string[],
  classroom: Classroom,
  currentUserRole: string,
}

const ClassroomDetail: NextPage<PageProps> = ({ allUsersSectioned, userRoles, classroom, currentUserRole }) => {
  const router = useRouter();
  const { data, status } = useSession();

  async function removeClassroom(archive: boolean) {

    // console.log(`session=${JSON.stringify(session)}`);

    const removed = await fetch('../api/classrooms/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "classroomId": classroom.id,
        "archive": archive
      })
    });

    if (removed.status == 200) {
      if (archive) {
        router.reload();
      }
      else {
        // return to classrooms list since this detail page no longer exists
        router.replace("/classroom/list");
      }
    }
    else {
      // TODO: Show toast for success / fail beyond the redirect
      console.log(`detail ${removed.status}: ${JSON.stringify(await removed.json())}`);
    }
  }

  let elevatedPrivileges = false;
  allUsersSectioned.every((user, idx) => {
    if (user.id == data?.user?.id && (userRoles[idx] == "Assistant" || "Instructor")) {
      elevatedPrivileges = true;
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="container mx-auto">
        <Head>
          <title>{`${classroom.name} | V-Room`}</title>
          <meta name="description" content="Reimagining Office Hours" />
          <link rel="icon" href="/favicon.svg" />
        </Head>

        <Header></Header>
        {status == "authenticated" && (
          <main className="container mx-auto h-5/6 flex flex-col items-left p-4">
            <div className="flex flex-row">
              <h1 className="text-lg leading-normal p-4 flex-grow">
                <span className="text-red-500">Users for </span>
                <span>{classroom.name} </span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${classroom.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {classroom.active ? 'Active' : 'Inactive'}
                </span>
              </h1>
              <ClassroomSettingsDropdown onArchiveClassroom={() => removeClassroom(true)} onDeleteClassroom={() => removeClassroom(false)}></ClassroomSettingsDropdown>
            </div>
            <UserTable router={router} users={allUsersSectioned} userRoles={userRoles} classroom={classroom} currentUserRole={currentUserRole} ></UserTable>
            {elevatedPrivileges && <Link className="btn" href="/meeting/host">Host a meeting</Link>}
          </main>
        )
        }
        {status != "authenticated" &&
          <main className="max-h-[50rem] min-h-[50rem]">
            It seems you aren&apos;t logged in. Please return to <Link href={'/'}><a className="text-red-500 hover:text-decoration-underline">the home page</a></Link> to sign in, then try again.
          </main>
        }
        <Footer></Footer>
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions);
  const allUsers = await getAllUsers();
  const classroomId = context.query.classroomId;
  if (typeof classroomId === 'string' && session) {
    const classroom = await getClassroom(classroomId as string);
    const splitUsers = await getUsersForClassroom(classroomId as string);
    const enrolledUsers =
      splitUsers.studentUsers.concat(splitUsers.assistantUsers.concat(splitUsers.instructorUsers));
    const unenrolledUsers = allUsers.filter(user1 =>
      !enrolledUsers.map(user2 => user2.id).includes(user1.id)
    );
    const userRoles: string[] = [];
    let currentUserRole = "";
    splitUsers.studentUsers.forEach((element) => {
      userRoles.push("student");
      if (element.email == session?.user?.email) {
        currentUserRole = "student";
      }
    });
    splitUsers.assistantUsers.forEach((element) => {
      userRoles.push("assistant");
      if (element.email == session?.user?.email) {
        currentUserRole = "assistant";
      }
    });
    splitUsers.instructorUsers.forEach((element) => {
      userRoles.push("instructor");
      if (element.email == session?.user?.email) {
        currentUserRole = "instructor";
      }
    });
    unenrolledUsers.forEach((element) => {
      userRoles.push("None");
      if (element.email == session?.user?.email) {
        currentUserRole = "None";
      }
    });
    const allUsersSectioned = enrolledUsers.concat(unenrolledUsers);
    return { props: { allUsersSectioned, userRoles, classroom, currentUserRole } };
  }
  else {
    const classroom = null;
    const enrolledUsers = null;
    const currentUserRole = null;
    return { props: { allUsers, classroom, enrolledUsers, currentUserRole } };
  }

}

export default ClassroomDetail;