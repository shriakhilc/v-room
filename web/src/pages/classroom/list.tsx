import type { NextPage } from "next";
import Head from "next/head";
import Header from "../../components/header"
import Footer from "../../components/footer"
import { getAllClassrooms } from "../api/classroom";
import type { Classroom } from '@prisma/client';
import React from "react";

type PageProps = {
  data: Classroom[];
}

const ClassroomList: NextPage<PageProps> = ({ data }) => {
  const [classrooms, setClassrooms] = React.useState(data);

  return (
    <>
      <div className="container mx-auto h-screen">
        <Head>
          <title>V-Room</title>
          <meta name="description" content="Reimagining Office Hours" />
          <link rel="icon" href="/favicon.svg" />
        </Head>

        <Header></Header>

        <main className="container mx-auto h-2/3 flex flex-col items-left p-4">
          <h1 className="text-base leading-normal">
            Welcome to <span className="text-red-500">the Classroom List Page</span>
          </h1>
          <ul>
            {classrooms.map(function(classroom, index){
              return <li key={index}>{JSON.stringify(classroom)}</li>
            })}
          </ul>
          <button onClick={async () => setClassrooms(await addClassroom())} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Add Classroom</button>
        </main>

        <Footer></Footer>
      </div>
    </>
  );
};

const addClassroom = async () => {
  const data = await getAllClassrooms();
  return data;
}

export async function getServerSideProps() {
  const data = await getAllClassrooms();
  return { props: { data }};
}

export default ClassroomList;