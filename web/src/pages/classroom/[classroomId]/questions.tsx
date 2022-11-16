import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from 'next/router';
import React from "react";

import { trpc } from '@/src/utils/trpc';

import Footer from "@/src/components/footer";
import Header from "@/src/components/header";
import QuestionBox from "@/src/components/QuestionBox";
import FilterDropdown from "@/src/components/FilterDropdown";
import { Prisma } from "@prisma/client";


const QuestionListPage: NextPage = () => {
  const router = useRouter();
  const classroomId = router.query.classroomId as string;
  const utils = trpc.useContext();

  const { data: session, status: sessionStatus } = useSession();
  const [show, setShow] = React.useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = React.useState("");
  const [newQuestionBody, setNewQuestionBody] = React.useState("");
  const [error, setError] = React.useState(false);
  const [searchStr, setSearchStr] = React.useState("");
  const [sortStr, setSortStr] = React.useState("");

  const { data: classroom, status: classroomStatus } = trpc.useQuery(['classroom.byId', { id: classroomId }],
    {
      enabled: session?.user?.id != undefined,
    }
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

  const { data: currentUser, status: currentUserStatus } = trpc.useQuery(
    ['user.byId', { id: session?.user?.id as string}],
    {
        enabled: session?.user?.id != undefined,
    }
  );

  const { data: userOnClassroom, status: userOnClassroomStatus } = trpc.useQuery(
    ['userOnClassroom.byClassroomAndUserId', {userId: currentUser?.id as string, classroomId: classroomId }],
    {
        enabled: session?.user?.id != undefined,
    }
)

  const addQuestion = trpc.useMutation('question.add');

  function showModal() {
    setShow(true);
  }

  function formCompleted() {
    return newQuestionBody == "" || newQuestionTitle == "";
  }

  function onSortQuestions(value: string) {
    console.log("re-sort");
    setSortStr(value);
  }

  function compareFn(
    a: Prisma.QuestionGetPayload<{include: { user: true, classroom: true, answer: {include: {user: true}}}}>, 
    b: Prisma.QuestionGetPayload<{include: { user: true, classroom: true, answer: {include: {user: true}}}}>) {
   
      console.log("compare");
      if(sortStr == "name") {
      return a.questionTitle.localeCompare(b.questionTitle);
    }
    else if(sortStr == "date") {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    else if(sortStr == "user") {
      return a.user.name?.localeCompare(b.user.name as string) as number;
    }
    else {
      return 0;
    }
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

  if (currentUserStatus != "success") {
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
            {currentUserStatus == "error" ?
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

  if (userOnClassroomStatus != "success") {
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
            {userOnClassroomStatus == "error" ?
              <>Error fetching user-classroom relation.</>
              :
              <>Loading...</>
            }

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
                <div className="flex flex-row items-center justify-between px-2">
                  <div>Filter results: <input value={searchStr} onChange={(e) => setSearchStr(e.currentTarget.value)} type="text" className="text-gray-900 rounded"></input></div> 
                  <div><FilterDropdown onSortQuestions={onSortQuestions}></FilterDropdown></div>
                </div>
                {searchStr == "" &&
                  <ul>
                    {[...questions].sort(compareFn).map(question => (
                      <li key={question.questionId}>
                        <QuestionBox question={question} answers={question.answer} user={question.user} router={router} currentUserRole={userOnClassroom.role} classroomActive={classroom.active}></QuestionBox>
                      </li>
                    ))}
                  </ul>
                }
                {(searchStr != "" && searchQuestions) &&
                  <ul>
                    {[...searchQuestions].sort(compareFn).map(question => (
                      <li key={question.questionId}>
                        <QuestionBox question={question} answers={question.answer} user={question.user} router={router} currentUserRole={userOnClassroom.role} classroomActive={classroom.active}></QuestionBox>
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
            {classroom.active &&
              <button onClick={showModal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 m-4 rounded">Ask a Question</button>
            }
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
        </main >


        <Footer></Footer>
      </div>
    </>
  );
};


export default QuestionListPage;