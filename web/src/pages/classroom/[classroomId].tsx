import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import React, { useState } from "react";
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

import { trpc } from '@/src/utils/trpc';

import Header from "@/src/components/header"
import Footer from "@/src/components/footer"
import UserTable from "@/src/components/userTable";
import ClassroomSettingsDropdown from "@/src/components/classroomSettingsDropdown";

const ClassroomDetail: NextPage = () => {
  const router = useRouter();
  const classroomId = router.query.classroomId as string;

  const { data: session, status: sessionStatus } = useSession();
  const [meetings, setMeetings] = useState([]);

  // TODO: example of how to do queries, these also have callbacks
  // https://trpc.io/docs/v9/react-queries
  // https://tanstack.com/query/v4/docs/reference/useQuery
  // TODO: Look into sorting on database side to achieve sectioning
  const { data: allUsersSectioned, status: allUserStatus } = trpc.useQuery(['user.all']);
  // TODO: use onSuccess to get rid of the "{} | undefined" errors
  const { data: classroom, status: classroomStatus } = trpc.useQuery(['classroom.byId', { id: classroomId }]);

  // https://trpc.io/docs/v9/react-mutations
  // https://tanstack.com/query/v4/docs/reference/useMutation
  const deleteClassroom = trpc.useMutation('classroom.delete');
  const archiveClassroom = trpc.useMutation('classroom.archive');

  async function onDeleteClassroom() {
    await deleteClassroom.mutateAsync({ id: classroomId }, {
      onSuccess(data, variables, context) {
        // return to classrooms list since this detail page no longer exists
        router.replace("/classroom/list");
      },
      onError(error, variables, context) {
        console.log(`pages/classroom/${classroomId}: ERROR: ${error}`);
      },
    });
  }

  async function onArchiveClassroom() {
    await archiveClassroom.mutateAsync({ id: classroomId }, {
      onSuccess(data, variables, context) {
        // TODO: some stateful way to refresh component instead of full page?
        router.reload();
      },
      onError(error, variables, context) {
        console.log(`pages/classroom/${classroomId}: ERROR: ${error}`);
      },
    });
  }

  async function getMeetings() {
    fetch('../api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "classroomId": classroomId,
        "get": true,
      })
    }).then(async response => setMeetings(await response.json()));
  }
  getMeetings();

  let elevatedPrivileges = false;
  allUsersSectioned.every((user, idx) => {
    if (user.id == session?.user?.id && (userRoles[idx] === "assistant" || userRoles[idx] === "instructor")) {
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

        <Header session={session} status={sessionStatus}></Header>

        {sessionStatus == "authenticated" && (
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
              {currentUserRole === "instructor" &&
                <ClassroomSettingsDropdown onArchiveClassroom={onArchiveClassroom} onDeleteClassroom={onDeleteClassroom}></ClassroomSettingsDropdown>
              }
            </div>
            <UserTable router={router} users={allUsersSectioned} userRoles={userRoles} classroom={classroom} currentUserRole={currentUserRole} ></UserTable>
            {elevatedPrivileges ?
              <Link className="btn" href={"/meeting/host?classroomid=" + classroom.id}>Host a meeting</Link>
              : (meetings[0] ?
                <Link className="btn" href={"/meeting/join?hostid=" + meetings[0]}>Join a meeting</Link>
                : <p>No meetings</p>
              )
            }
          </main>
        )
        }
        {sessionStatus != "authenticated" &&
          <main className="max-h-[50rem] min-h-[50rem]">
            It seems you aren&apos;t logged in. Please return to <Link href={'/'}><a className="text-red-500 hover:text-decoration-underline">the home page</a></Link> to sign in, then try again.
          </main>
        }
        <Footer></Footer>
      </div>
    </>
  );
};

// TODO: Completely get rid of this
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