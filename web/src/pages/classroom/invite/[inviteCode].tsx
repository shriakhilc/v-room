import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Header from "../../../components/header"
import Footer from "../../../components/footer"
import type { Classroom } from '@prisma/client';
import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { authOptions } from "../../api/auth/[...nextauth]";
import { unstable_getServerSession, User } from "next-auth";
import { getUserByEmail } from "../../api/user/[userId]";
import { getClassroomsForUser } from "../../api/classrooms/users/[userId]";
import { getClassroom } from "../../api/classrooms/[classroomId]";

type PageProps = {
  classroom: Classroom,
  user: User
}

const ClassroomList: NextPage<PageProps> = ({ classroom, user }) => {
  const {data, status} = useSession();

  async function joinClassroom() {
    
  }

  return (
    <>
      <div className="container mx-auto">
        <Head>
          <title>V-Room</title>
          <meta name="description" content="Reimagining Office Hours" />
          <link rel="icon" href="/favicon.svg" />
        </Head>

        <Header session={data} status={status}></Header>

        {status == "authenticated" &&
          <main className="container mx-auto h-5/6 flex flex-col items-left p-4">
            <h1 className="text-lg leading-normal p-4">
              <span className="text-red-500">Join {classroom.name}?</span>
            </h1>
            <button onClick={joinClassroom} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 m-4 rounded">Join</button>
            
          </main>}

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
  if (session) {
    const user = await getUserByEmail(session.user?.email);
    if (user && context.params?.classroomId) {
      const classroom = await getClassroom(context.params?.classroomId as string);
      return { props: { classroom: classroom, user: user } };
    }
  }
  else {
    return { props: { classroom: null, user: null } };
  }

}

export default ClassroomList;