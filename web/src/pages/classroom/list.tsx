import ClassroomTable from "@/src/components/classroomTable";
import { inferQueryOutput, trpc } from '@/src/utils/trpc';
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useState } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";

const ClassroomList: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [classrooms, setClassrooms] = useState<inferQueryOutput<'user.getClassrooms'>>([]);

  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newCourseNumber, setNewCourseNumber] = useState("");
  const [newCrn, setNewCrn] = useState("");

  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  const utils = trpc.useContext();

  // query won't get called unless condition in 'enabled' is true
  // TODO: Find correct way to handle type-safety without using non-null assertion (!)
  trpc.useQuery(
    ['user.getClassrooms', { id: session!.user!.id }],
    {
      enabled: (session != null && session.user != undefined),
      onSuccess(data) {
        setClassrooms(data);
      },

      onError(err) {
        // Only happens if user doesn't exist, which shouldn't occur due to session validation
        console.log(`pages/classroom/list: ERROR: ${err}`);
      },
    }
  );

  const addClassroom = trpc.useMutation('classroom.add');

  const onAddClassroom = useCallback(
    async () => {
      if (session == null || session.user == undefined) {
        // This shouldn't happen normally, but explicit condition ensures type-safety
        console.log('pages/classroom/list: ERROR: session.user not available to add as instructor');
        return;
      }

      await addClassroom.mutateAsync(
        {
          name: newName,
          department: newDept,
          courseNumber: parseInt(newCourseNumber, 10),
          crn: parseInt(newCrn, 10),
          userId: session.user.id
        },
        {
          async onSuccess() {
            utils.invalidateQueries(['user.getClassrooms']);

            // reset form fields
            setNewName("");
            setNewCourseNumber("");
            setNewCrn("");
            setNewDept("");

            setShow(false);
          },
          onError(error) {
            // Shouldn't be possible
            console.log(`pages/classroom/list: ERROR: ${error}`);
            setError(true);
          },
        }
      );
    },
    [session, newName, , newDept, newCourseNumber, newCrn, utils, addClassroom],
  );

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
          <title>Classrooms | V-Room</title>
          <meta name="description" content="Reimagining Office Hours" />
          <link rel="icon" href="/favicon.svg" />
        </Head>

        <Header session={session} status={sessionStatus}></Header>

        {sessionStatus == "authenticated" ?
          <main className="container mx-auto h-5/6 flex flex-col items-left p-4">
            <h1 className="text-lg leading-normal p-4">
              <span className="text-red-500">Your Classrooms</span>
            </h1>

            <ClassroomTable classrooms={classrooms}></ClassroomTable>

            <button onClick={showModal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 m-4 rounded">Add Classroom</button>
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
                    <input value={newName} onChange={e => setNewName(e.target.value)} type="text" name="courseName" id="courseName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="Intro to CS"></input>
                  </div>
                  <div className="pr-6 pl-6 pb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Course Department</label>
                    <input value={newDept} onChange={e => setNewDept(e.target.value)} type="text" name="department" id="department" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="CS"></input>
                  </div>
                  <div className="pr-6 pl-6 pb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Course Number</label>
                    <input value={newCourseNumber} onChange={e => setNewCourseNumber(e.target.value.replace(/\D/, ''))} type="text" name="courseNumber" id="courseNumber" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="1001"></input>
                  </div>
                  <div className="pr-6 pl-6 pb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Course CRN</label>
                    <input value={newCrn} onChange={e => setNewCrn(e.target.value.replace(/\D/, ''))} type="text" name="crn" id="crn" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="12345"></input>
                  </div>
                  <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-600">
                    <button disabled={formCompleted()} onClick={onAddClassroom} type="button" className="focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-grey-200 disabled:text-grey:600 bg-red-500 hover:bg-red-700 text-white focus:ring-red-300">Create Classroom</button>
                    <button onClick={() => { setShow(false); setError(false) }} type="button" className="focus:ring-4 focus:outline-none rounded-lg border text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 bg-gray-700 text-gray-300 border-gray-500 hover:text-white hover:bg-gray-600 focus:ring-gray-600">Close</button>
                  </div>
                  {error &&
                    <div>
                      Error creating classroom.
                    </div>
                  }
                </div>
              </div>
            }
          </main>
          :
          <main className="max-h-[50rem] min-h-[50rem]">
            {sessionStatus == "unauthenticated" ?
              <span>It seems you aren&apos;t logged in. Please return to <Link href={'/'}><a className="text-red-500 hover:text-decoration-underline">the home page</a></Link> to sign in, then try again.</span>
              :
              <span>Loading...</span>
            }
          </main>
        }

        <Footer></Footer>
      </div >
    </>
  );
};

export default ClassroomList;