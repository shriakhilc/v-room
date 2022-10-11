import type { NextPage } from "next";
import Head from "next/head";

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
      </main>
    </>
  );
};

export default Home;