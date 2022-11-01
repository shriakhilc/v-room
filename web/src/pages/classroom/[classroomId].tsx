import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Header from "../../components/header"
import Footer from "../../components/footer"
import type { Classroom, User } from '@prisma/client';
import React, { useState } from "react";
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
import ReplyBox from "@/src/components/ReplyBox";
import QuestionBox from "@/src/components/QuestionBox";

type PageProps = {
  allUsersSectioned: User[],
  userRoles: string[],
  classroom: Classroom,
  currentUserRole: string,
}

const ClassroomDetail: NextPage<PageProps> = ({ allUsersSectioned, userRoles, classroom, currentUserRole }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [meetings, setMeetings] = useState([]);
  const [show, setShow] = React.useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = React.useState("");
  const [newQuestionBody, setNewQuestionBody] = React.useState("");
  const [error, setError] = React.useState(false);

  async function removeClassroom(archive: boolean) {
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
  
  async function addQuestion () {
    const created = await fetch('../api/question/create', {
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "classroomId": classroom.id,
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

        <Header session={session} status={status}></Header>
        
        {status == "authenticated" && (
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
                    <button disabled={formCompleted()} onClick={() => { setShow(false); }} type="button" className="focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-grey-200 disabled:text-grey:600 bg-red-500 hover:bg-red-700 text-white focus:ring-red-300">Submit Question</button>
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
            </section>
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