import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from 'next/router';
import React, { useMemo } from "react";

import { trpc } from '@/src/utils/trpc';

import ClassroomSettingsDropdown from "@/src/components/classroomSettingsDropdown";
import Footer from "@/src/components/footer";
import Header from "@/src/components/header";
import UserTable from "@/src/components/userTable";
import { Prisma, UserRole } from "@prisma/client";

const ClassroomDetail: NextPage = () => {
  const router = useRouter();
  const classroomId = router.query.classroomId as string;
  const utils = trpc.useContext();
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
        onSuccess: () => utils.invalidateQueries(['classroom.sectionedUsers']),
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
        onSuccess: () => utils.invalidateQueries(['classroom.sectionedUsers']),
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
      onSuccess: () => utils.invalidateQueries(['classroom.byId']),
      onError(error) {
        // Forbidden error based on user role, should not occur normally since menu only visible to instructors
        console.log(`pages/classroom/${classroomId}: ERROR: ${error}`);
      },
    });
  }

  const { data: meetings, status: meetingsStatus } = trpc.useQuery(
    ['meeting.getForClassroom', { classroomId: classroomId }],
    {
      enabled: classroomStatus == "success" && classroom != undefined,
    }
  );


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

  if (classroomStatus != "success") {
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
            {classroomStatus == "error" ?
              <>Could not find classroom.</>
              :
              <>Loading...</>
            }
          </main>
          <Footer></Footer>
        </div>
      </>
    );
  }

  if (userStatus != "success") {
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
            {userStatus == "error" ?
              <>Error fetching users.</>
              :
              <>Loading...</>
            }

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

        <main>
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
            <div className="flex flex-row items-center justify-between">
              <div>
                {
                  (currentUserRole == UserRole.INSTRUCTOR || currentUserRole == UserRole.ASSISTANT) && (
                    <Link className="btn" href={`/meeting/host?classroomid=${classroom.id}`}>Host a meeting</Link>
                  )
                }
                {/* display list if not undefined or empty */}
                {meetings?.at(0) ?
                  <Link className="btn" href={`/meeting/${meetings[0]}`}>Join a meeting</Link>
                  : <p>No meetings</p>
                }
                </div>
              <div>
                <button onClick={() => {router.push('/classroom/' + classroom.id + "/questions")}} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 m-4 rounded">View questions {'>>'}</button>
              </div>
            </div> 
          </section >
        </main >


        <Footer></Footer>
      </div>
    </>
  );
};


export default ClassroomDetail;