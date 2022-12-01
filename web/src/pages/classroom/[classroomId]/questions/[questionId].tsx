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

const SingleQuestionPage: NextPage = () => {
  const router = useRouter();
  const classroomId = router.query.classroomId as string;
  const questionId = router.query.questionId as string;
  const utils = trpc.useContext();

  const { data: session, status: sessionStatus } = useSession();
  const { data: classroom, status: classroomStatus } = trpc.useQuery(['classroom.byId', { id: classroomId }],
    {
      enabled: session?.user?.id != undefined,
    }
  );

  const { data: thisQuestion, status: questionStatus } = trpc.useQuery(
    ['question.byId', { questionId: questionId }],
    {
      enabled: questionId != undefined,
    }
  );

  const { data: allQuestions, status: allQuestionsStatus } = trpc.useQuery(
    ['question.byClassroom', { classroomId: classroomId}],
    {
        enabled: classroomStatus === 'success' && classroom != undefined
    }
  );

  const { data: currentUser, status: currentUserStatus } = trpc.useQuery(
    ['user.byId', { id: session?.user?.id as string}],
    {
        enabled: session?.user?.id != undefined,
    }
  )

  const { data: userOnClassroom, status: userOnClassroomStatus } = trpc.useQuery(
    ['userOnClassroom.byClassroomAndUserId', {userId: currentUser?.id as string, classroomId: classroomId }],
    {
        enabled: session?.user?.id != undefined,
    }
)

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

  if(allQuestionsStatus != "success" || questionStatus != "success") {
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
              {(questionStatus == "error" || allQuestionsStatus == "error") ?
                <>Error fetching questions.</>
                :
                <>Loading...</>
              }
  
            </main>
            <Footer></Footer>
          </div>
        </>
      );
  }

  
  if(!allQuestions.find(element => element.questionId === thisQuestion.questionId)) {
    console.log(allQuestions);
    console.log(thisQuestion);
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
                <>Invalid question/classroom pair.</>
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
            {thisQuestion &&
              <div className="overflow-auto max-h-[50rem]">
                <button onClick={() => { router.push('/classroom/' + classroom.id + "/questions") }} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 m-4 rounded">{'<<'} Back to Questions</button>
                <QuestionBox question={thisQuestion} answers={thisQuestion.answer} user={thisQuestion.user} router={router} currentUserRole={userOnClassroom.role} classroomActive={classroom.active} classroomId={classroom.id}></QuestionBox>
              </div>
            }
          </section>
        </main >


        <Footer></Footer>
      </div>
    </>
  );
};


export default SingleQuestionPage;