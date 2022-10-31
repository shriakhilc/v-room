import type { NextPage } from "next";
import Head from "next/head";
import React, { useMemo, useState } from "react";
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import Link from "next/link";

import { trpc } from '@/src/utils/trpc';

import Header from "@/src/components/header"
import Footer from "@/src/components/footer"
import UserTable from "@/src/components/userTable";
import ClassroomSettingsDropdown from "@/src/components/classroomSettingsDropdown";
import { UserRole } from "@prisma/client";
import ReplyBox from "@/src/components/ReplyBox";
import QuestionBox from "@/src/components/QuestionBox";

const ClassroomDetail: NextPage = () => {
  const router = useRouter();
  const classroomId = router.query.classroomId as string;

  const { data: session, status: sessionStatus } = useSession();

  const { data: classroom, status: classroomStatus } = trpc.useQuery(['classroom.byId', { id: classroomId }],
    {
      enabled: session?.user?.id != undefined,
    }
  );

  const { data: allUsersSectioned, status: userStatus } = trpc.useQuery(
    ['classroom.sectionedUsers', { classroomId: classroomId }],
    {
      enabled: classroomStatus == "success" && classroom != undefined,
    }
  );

  const currentUserRole = useMemo(
    () => allUsersSectioned?.enrolled.find(x => x.user.id == session?.user?.id)?.role,
    [allUsersSectioned, session]
  );


  const deleteClassroom = trpc.useMutation('classroom.delete');
  const archiveClassroom = trpc.useMutation('classroom.archive');
  const addUser = trpc.useMutation('classroom.addUser');
  const removeUser = trpc.useMutation('classroom.removeUser');

  async function addUserToClassroom(userId: string, role: UserRole) {
    await addUser.mutateAsync(
      {
        classroomId: classroomId,
        userId: userId,
        role: role
      },
      {
        // TODO: Is this just router.reload() ? Can we do better by invalidating users
        // TODO: Table not auto-updating could be due to unmount
        // TOOD: investigate the constant prisma queries on terminal, maybe incorrect usage of hooks
        onSuccess: () => router.replace(router.asPath),
        onError(error) {
          // Forbidden error based on user role, should not occur normally since menu only visible to instructors
          console.log(`userTable: ERROR: ${error}`);
        },
      }
    );
  }

  async function removeUserFromClassroom(userId: string) {
    console.log("Removing");
    await removeUser.mutateAsync(
      {
        classroomId: classroomId,
        userId: userId,
      },
      {
        // TODO: Is this just router.reload() ? Can we do better by invalidating users
        onSuccess: () => router.replace(router.asPath),
        onError(error) {
          // Forbidden error based on user role, should not occur normally since menu only visible to instructors
          console.log(`userTable: ERROR: ${error}`);
        },
      }
    );
  }


  async function onDeleteClassroom() {
    await deleteClassroom.mutateAsync({ id: classroomId }, {
      onSuccess() {
        // return to classrooms list since this detail page no longer exists
        router.replace("/classroom/list");
      },
      onError(error) {
        // Forbidden error based on user role, should not occur normally since menu only visible to instructors
        console.log(`pages/classroom/${classroomId}: ERROR: ${error}`);
      },
    });
  }

  async function onArchiveClassroom() {
    await archiveClassroom.mutateAsync({ id: classroomId }, {
      onSuccess() {
        // TODO: would invalidating classroom.byId work to refresh page?
        router.reload();
      },
      onError(error) {
        // Forbidden error based on user role, should not occur normally since menu only visible to instructors
        console.log(`pages/classroom/${classroomId}: ERROR: ${error}`);
      },
    });
  }

  // const [meetings, setMeetings] = useState([]);
  // async function getMeetings() {
  //   fetch('../api/meetings', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       "classroomId": classroomId,
  //       "get": true,
  //     })
  //   }).then(async response => setMeetings(await response.json()));
  // }
  // TODO: this needs to be a subscription or some kind of polling, so it updates when someone else hosts a meeting
  //getMeetings();


  if (sessionStatus != "authenticated") {
    return (
      <>
        <div className="container mx-auto">
          <Head>
            <title>V-Room</title>
            <meta name="description" content="Reimagining Office Hours" />
            <link rel="icon" href="/favicon.svg" />
          </Head>
          <Header></Header>
          <main className="max-h-[50rem] min-h-[50rem]">
            {sessionStatus == "unauthenticated" ?
              <>It seems you aren&apos;t logged in. Please return to <Link href={'/'}><a className="text-red-500 hover:text-decoration-underline">the home page</a></Link> to sign in, then try again.</>
              :
              <>Loading...</>
            }
          </main>
          <Footer></Footer>
        </div>
      </>
    );
  }

  if (classroom == undefined) {
    return (
      <>
        <div className="container mx-auto">
          <Head>
            <title>V-Room</title>
            <meta name="description" content="Reimagining Office Hours" />
            <link rel="icon" href="/favicon.svg" />
          </Head>
          <Header></Header>
          <main className="max-h-[50rem] min-h-[50rem]">Could not find classroom.</main>
          <Footer></Footer>
        </div>
      </>
    );
  }

  if (allUsersSectioned == undefined) {
    return (
      <>
        <div className="container mx-auto">
          <Head>
            <title>V-Room</title>
            <meta name="description" content="Reimagining Office Hours" />
            <link rel="icon" href="/favicon.svg" />
          </Head>
          <Header></Header>
          <main className="max-h-[50rem] min-h-[50rem]">
            Users undefined.
          </main>
          <Footer></Footer>
        </div>
      </>
    );
  }


  if (currentUserRole == undefined) {
    return (
      <>
        <div className="container mx-auto">
          <Head>
            <title>V-Room</title>
            <meta name="description" content="Reimagining Office Hours" />
            <link rel="icon" href="/favicon.svg" />
          </Head>
          <Header></Header>
          <main className="max-h-[50rem] min-h-[50rem]">
            It seems you aren&apos;t a member of {classroom.name}. Please contact the instructors or return to <Link href={'/'}><a className="text-red-500 hover:text-decoration-underline">the home page</a></Link> to view your classrooms.
          </main>
          <Footer></Footer>
        </div>
      </>
    );
  }

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
          <main>
            <section className="container mx-auto flex flex-col items-left p-4">
              <QuestionBox></QuestionBox>
            </section>
            <section className="container mx-auto h-5/6 flex flex-col items-left p-4">
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
                {currentUserRole == UserRole.INSTRUCTOR &&
                  <ClassroomSettingsDropdown onArchiveClassroom={onArchiveClassroom} onDeleteClassroom={onDeleteClassroom}></ClassroomSettingsDropdown>
                }
              </div>
              <UserTable
                users={allUsersSectioned}
                currentUserRole={currentUserRole}
                onAddUser={addUserToClassroom}
                onRemoveUser={removeUserFromClassroom}
              ></UserTable>

              {/* TODO: better way to join and host meetings */}
              {(currentUserRole == UserRole.INSTRUCTOR || currentUserRole == UserRole.ASSISTANT) && (
                <Link className="btn" href={"/meeting/host?classroomid=" + classroom.id}>Host a meeting</Link>
              )}
              {/* {meetings[0] ?
                <Link className="btn" href={"/meeting/join?hostid=" + meetings[0]}>Join a meeting</Link>
                : <p>No meetings</p>
              } */}
            </section>
          </main>
        )}
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

export default ClassroomDetail;