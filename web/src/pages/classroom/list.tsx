import type { NextPage } from "next";
import Head from "next/head";
import Header from "../../components/header"
import Footer from "../../components/footer"
import { getAllClassrooms } from "../api/classrooms";
import ClassroomTable from "@/src/components/classroomTable";
import type { Classroom } from '@prisma/client';
import React from "react";

type PageProps = {
  data: Classroom[];
}

const ClassroomList: NextPage<PageProps> = ({ data }) => {
  const [classrooms, setClassrooms] = React.useState(data);
  const [show, setShow]  = React.useState(false);
  const [newName, setNewName]  = React.useState("");
  const [newDept, setNewDept]  = React.useState("");
  const [newCourseNumber, setNewCourseNumber]  = React.useState("");
  const [newCrn, setNewCrn]  = React.useState("");
  const [error, setError] = React.useState(false);
  

  async function addClassroom() {
    console.log("adding classroom");
    const created = await fetch('../api/classrooms/create', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        "name": newName,
        "department": newDept,
        "courseNumber": parseInt(newCourseNumber, 10),
        "crn": parseInt(newCrn, 10) 
      })
    });
    if(created.status == 200) {
      const res = await fetch('../api/classrooms/', {
        method: 'GET'
      });
      const newClassrooms = await res.json();
      setClassrooms(newClassrooms.classrooms);
    }
    else {
      setError(true);
      console.log(created);
    }

  }

  function showModal() {
    setShow(true);
  }
  
function formCompleted() {
  return newName == "" || newDept == "" || newCourseNumber == "" || newCrn == "";
}


  return (
    <>
      <div className="container mx-auto">
        <Head>
          <title>V-Room</title>
          <meta name="description" content="Reimagining Office Hours" />
          <link rel="icon" href="/favicon.svg" />
        </Head>

        <Header></Header>

        <main className="container mx-auto h-5/6 flex flex-col items-left p-4">
          <h1 className="text-lg leading-normal p-4">
            <span className="text-red-500">Your Classrooms</span>
          </h1>
          <ClassroomTable classrooms={classrooms}></ClassroomTable>
          <button onClick={showModal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 m-4 rounded">Add Classroom</button>
          { show && 
            <div
            className="fixed w-2/4 left-1/4 top-1/4"
            onClick={e => {
              // do not close modal if anything inside modal content is clicked
              e.stopPropagation();
            }}
            >

            <div className="relative"></div>
              <div className="relative bg-white rounded-lg shadow">
                <div className="flex justify-between items-start p-4 rounded-t border-b border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Terms of Service
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    <p className="text-base leading-relaxed text-gray-900">
                        Input course information.
                    </p>
                </div>
                <div className="pr-6 pl-6 pb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-900">Course Name</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} type="text" name="courseName" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="Intro to CS"></input>
                </div>
                <div className="pr-6 pl-6 pb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-900">Course Department</label>
                  <input value={newDept} onChange={e => setNewDept(e.target.value)} type="text" name="department" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="CS"></input>
                </div>
                <div className="pr-6 pl-6 pb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-900">Course Number</label>
                  <input value={newCourseNumber} onChange={e => setNewCourseNumber(e.target.value.replace(/\D/,''))} type="text" name="courseNumber" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="1001"></input>
                </div>
                <div className="pr-6 pl-6 pb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-900">Course CRN</label>
                  <input value={newCrn} onChange={e => setNewCrn(e.target.value.replace(/\D/,''))} type="text" name="crn" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="12345"></input>
                </div>
                <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-600">
                    <button disabled={formCompleted()} onClick={() => {addClassroom()}} type="button" className="focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-grey-200 disabled:text-grey:600 bg-red-500 hover:bg-red-700 text-white focus:ring-red-300">Create Classroom</button>
                    <button onClick={() => {setShow(false); setError(false)}} type="button" className="focus:ring-4 focus:outline-none rounded-lg border text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 bg-gray-700 text-gray-300 border-gray-500 hover:text-white hover:bg-gray-600 focus:ring-gray-600">Close</button>
                </div>
                {error &&
                <div>
                  Error creating classroom.
                </div>}
              </div>
            </div> }
        </main>


        <Footer></Footer>
      </div>
    </>
  );
};

export async function getServerSideProps() {
  const data = await getAllClassrooms();
  return { props: { data }};
}

export default ClassroomList;