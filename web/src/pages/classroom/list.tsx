import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Header from "../../components/header"
import Footer from "../../components/footer"
import { getAllClassrooms } from "../api/classrooms";
import ClassroomTable from "@/src/components/classroomTable";
import type { Classroom } from '@prisma/client';
import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { getUserByEmail } from "../api/user/[userId]";
import { getClassroomsForUser } from "../api/classrooms/users/[userId]";

type PageProps = {
  classroomData: Classroom[],
  userRoles: string[],
  userEmail: string
}

const ClassroomList: NextPage<PageProps> = ({ classroomData, userRoles, userEmail }) => {
  const [classrooms, setClassrooms] = React.useState(classroomData);
  const [show, setShow]  = React.useState(false);
  const [newName, setNewName]  = React.useState("");
  const [newDept, setNewDept]  = React.useState("");
  const [newCourseNumber, setNewCourseNumber]  = React.useState("");
  const [newCrn, setNewCrn]  = React.useState("");
  const [error, setError] = React.useState(false);
  const [roles, setRoles] = React.useState(userRoles);
  const {data, status} = useSession();

  async function addClassroom() {
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
      const newClassroom = await created.json();
      const user = await fetch('../api/user/12345', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          email: data?.user?.email
        })
      });
      const userJson = await user.json();

      const newRelation = await fetch('../api/classrooms/users/add', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          userId: userJson.user.id,
          classroomId: newClassroom.result.id,
          role: 'instructor'
        })
      });

      const updatedClassrooms = await fetch('../api/classrooms/users/' + userJson.user.id, {
        method: 'GET'
      });
      const classroomsJson = await updatedClassrooms.json();
      console.log(classroomsJson);

      const userRoles:string[] = [];
      classroomsJson.studentClassrooms.forEach(() => {
        userRoles.push("student");
      });
      classroomsJson.assistantClassrooms.forEach(() => {
        userRoles.push("assistant");
      });
      classroomsJson.instructorClassrooms.forEach(() => {
        userRoles.push("instructor");
      });
      const concatenatedClassrooms = classroomsJson.studentClassrooms.concat(classroomsJson.assistantClassrooms.concat(classroomsJson.instructorClassrooms));
      setClassrooms(concatenatedClassrooms);
      setRoles(userRoles);
      console.log(userRoles);
      
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

        {status == "authenticated" &&
        <main className="container mx-auto h-5/6 flex flex-col items-left p-4">
          <h1 className="text-lg leading-normal p-4">
            <span className="text-red-500">Your Classrooms</span>
          </h1>
          <ClassroomTable classrooms={classrooms} roles={roles}></ClassroomTable>
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
                      Create New Classroom
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
        </main> }

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
  if(session) {
    const user = await getUserByEmail(session.user?.email);
    if(user) {
      const classrooms = await getClassroomsForUser(user.id);
      const userRoles:string[] = [];
      classrooms.studentClassrooms.forEach((element) => {
        userRoles.push("student");
      });
      classrooms.assistantClassrooms.forEach((element) => {
        userRoles.push("assistant");
      });
      classrooms.instructorClassrooms.forEach((element) => {
        userRoles.push("instructor");
      });
      const concatenatedClassrooms = classrooms.studentClassrooms.concat(classrooms.assistantClassrooms.concat(classrooms.instructorClassrooms));
      return { props: { classroomData: concatenatedClassrooms, userRoles: userRoles, userId: session.user?.email }};
    }
  }
  else {
    return {props: {classroomData: [], userRoles: []}};
  }

}

export default ClassroomList;