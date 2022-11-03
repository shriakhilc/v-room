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
<<<<<<< HEAD
=======
import { UserRole } from "@prisma/client";
>>>>>>> e1e9edfe9b8ea570a993406e5ded84b76fe92faf
import ReplyBox from "@/src/components/ReplyBox";
import QuestionBox from "@/src/components/QuestionBox";

const ClassroomDetail: NextPage = () => {
  const router = useRouter();
  const classroomId = router.query.classroomId as string;

  const { data: session, status: sessionStatus } = useSession();
  const [meetings, setMeetings] = useState([]);
  const [show, setShow] = React.useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = React.useState("");
  const [newQuestionBody, setNewQuestionBody] = React.useState("");
  const [error, setError] = React.useState(false);
<<<<<<< HEAD

  async function removeClassroom(archive: boolean) {
    const removed = await fetch('../api/classrooms/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "classroomId": classroom.id,
        "archive": archive
      })
    });
=======
>>>>>>> e1e9edfe9b8ea570a993406e5ded84b76fe92faf

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
  
  async function addQuestion () {
    const created = await fetch('../api/question/create', {
<<<<<<< HEAD
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "questionStr": newQuestionBody,
        "classroomId": classroom.id,
        "userId": session?.user?.id,
      })
    });
  }

  function showModal() {
    setShow(true);
  }

  function formCompleted() {
    return newQuestionBody == "" || newQuestionTitle == "";
  }

  async function getMeetings() {
    fetch('../api/meetings', {
=======
>>>>>>> e1e9edfe9b8ea570a993406e5ded84b76fe92faf
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "questionTitle": newQuestionTitle,
        "questionStr": newQuestionBody,
        "classroomId": classroomId,
        "userId": session?.user?.id,
      })
    });
  }

  function showModal() {
    setShow(true);
  }

  function formCompleted() {
    return newQuestionBody == "" || newQuestionTitle == "";
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
        
<<<<<<< HEAD
        {status == "authenticated" && (
=======
        {sessionStatus == "authenticated" && (
>>>>>>> e1e9edfe9b8ea570a993406e5ded84b76fe92faf
          <main>
            <section className="container mx-auto flex flex-col items-left p-4">
              <QuestionBox></QuestionBox>
              <button onClick={showModal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 m-4 rounded">Ask a Question</button>
              {show &&
              <div
                className="fixed w-2/4 left-1/4 top-20"
                onClick={e => {
                  // do not close modal if anything inside modal content is clicked
                  e.stopPropagation();
                }}
              >
                <div className="relative bg-white rounded-lg shadow">
                  <div className="flex justify-between items-start p-4 rounded-t border-b border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Ask a Question
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <p className="text-base leading-relaxed text-gray-900">
                      Input a descriptive title and your question.
                    </p>
                  </div>
                  <div className="pr-6 pl-6 pb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Question Title</label>
                    <input value={newQuestionTitle} onChange={e => setNewQuestionTitle(e.target.value)} type="text" name="questionTitle" id="questionTitle" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="What is a dog?"></input>
                  </div>
                  <div className="pr-6 pl-6 pb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Question Details</label>
                    <textarea value={newQuestionBody} onChange={e => setNewQuestionBody(e.target.value)} name="questionBody" id="questionBody" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="I don't know what a dog is."></textarea>
                  </div>
                  <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-600">
<<<<<<< HEAD
                    <button disabled={formCompleted()} onClick={() => { setShow(false); }} type="button" className="focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-grey-200 disabled:text-grey:600 bg-red-500 hover:bg-red-700 text-white focus:ring-red-300">Submit Question</button>
=======
                    <button disabled={formCompleted()} onClick={() => { addQuestion(); setShow(false); }} type="button" className="focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-grey-200 disabled:text-grey:600 bg-red-500 hover:bg-red-700 text-white focus:ring-red-300">Submit Question</button>
>>>>>>> e1e9edfe9b8ea570a993406e5ded84b76fe92faf
                    <button onClick={() => { setShow(false); setError(false) }} type="button" className="focus:ring-4 focus:outline-none rounded-lg border text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 bg-gray-700 text-gray-300 border-gray-500 hover:text-white hover:bg-gray-600 focus:ring-gray-600">Close</button>
                  </div>
                  {error &&
                    <div>
                      Error creating new question.
                    </div>}
                </div>
              </div>}
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
<<<<<<< HEAD
                {currentUserRole === "instructor" &&
                  <ClassroomSettingsDropdown onArchiveClassroom={() => removeClassroom(true)} onDeleteClassroom={() => removeClassroom(false)}></ClassroomSettingsDropdown>
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
=======
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
>>>>>>> e1e9edfe9b8ea570a993406e5ded84b76fe92faf
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