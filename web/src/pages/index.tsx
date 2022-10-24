import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { signIn } from 'next-auth/react';
import { authOptions } from "./api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>V-Room</title>
        <meta name="description" content="Reimagining Office Hours" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-extrabold leading-normal md:text-[5rem]">
          Welcome to <span className="text-red-500">V-Room</span>
        </h1>
        <h2 className="text-3xl font-bold">
          Reimagining virtual office hours
        </h2>
        <button onClick={() => signIn('google', {callbackUrl: '/user/profile?newUser=true' })} className="px-4 py-2 mt-4 border-none rounded-md bg-sky-500 hover:bg-sky-600 text-white">Sign In</button>
      </main>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const session = await unstable_getServerSession(context.req, context.res, authOptions);

  if (session != null) {
    // Auto-redirect if user already signed in
    return {
      redirect: {
        destination: '/classroom/list',
        permanent: false,
      },
    };
  }

  return { props: {} };
}

export default Home;