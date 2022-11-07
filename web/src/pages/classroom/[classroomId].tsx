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
  const utils = trpc.useContext();

  const { data: session, status: sessionStatus } = useSession();
  const [show, setShow] = React.useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = React.useState("");
  const [newQuestionBody, setNewQuestionBody] = React.useState("");
  const [error, setError] = React.useState(false);
  const [searchStr, setSearchStr] = React.useState("");

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

  const { data: questions, status: questionStatus } = trpc.useQuery(
    ['question.byClassroom', { classroomId: classroomId }],
    {
      enabled: classroomStatus == "success" && classroom != undefined,
    }
  );

  const { data: searchQuestions, status: searchQuestionStatus } = trpc.useQuery(
    ['question.bySearchStr', { searchStr: searchStr, userId: null, classroomId: classroomId }],
    {
      enabled: classroomStatus == "success" && classroom != undefined,
    }
  );

  const deleteClassroom = trpc.useMutation('classroom.delete');
  const archiveClassroom = trpc.useMutation('classroom.archive');
  const addUser = trpc.useMutation('classroom.addUser');
  const removeUser = trpc.useMutation('classroom.removeUser');
  const addQuestion = trpc.useMutation('question.add');

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

  async function onAddQuestion() {
    await addQuestion.mutateAsync({
      classroomId: classroomId,
      userId: session?.user?.id as string,
      questionTitle: newQuestionTitle,
      questionStr: newQuestionBody
    },
      {
        onSuccess: () => {
          utils.invalidateQueries(["question.byClassroom"]);
          utils.invalidateQueries(["question.bySearchStr"]);
        },
        onError(error) {
          console.log(`ERROR ${error}`);
        },
      });
    setNewQuestionBody("");
    setNewQuestionTitle("");
    setShow(false);
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
          <section className="container mx-auto flex flex-col items-left p-4">
            {questions &&
              <div className="overflow-auto max-h-[50rem]">
                <div className="py-2 text-4xl text-red-500 font-bold">
                  Questions for {classroom.name}
                </div>
                Filter results: <input value={searchStr} onChange={(e) => setSearchStr(e.currentTarget.value)} type="text" className="text-gray-900 rounded"></input>
                {searchStr == "" &&
                  <ul>
                    {questions.map(question => (
                      <li key={question.questionId}>
                        <QuestionBox question={question} answers={question.answer} user={question.user} router={router} currentUserRole={currentUserRole}></QuestionBox>
                      </li>
                    ))}
                  </ul>
                }
                {(searchStr != "" && searchQuestions) &&
                  <ul>
                    {searchQuestions.map(question => (
                      <li key={question.questionId}>
                        <QuestionBox question={question} answers={question.answer} user={question.user} router={router} currentUserRole={currentUserRole}></QuestionBox>
                      </li>
                    ))}
                  </ul>
                }
              </div>
            }
            {!questions &&
              <div className="py-2 text-2xl text-red-500">
                No questions yet!
              </div>
            }
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
                    <button disabled={formCompleted()} onClick={() => { onAddQuestion(); }} type="button" className="focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-grey-200 disabled:text-grey:600 bg-red-500 hover:bg-red-700 text-white focus:ring-red-300">Submit Question</button>
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
          </section >
        </main >


        <Footer></Footer>
      </div>
    </>
  );
};


export default ClassroomDetail;