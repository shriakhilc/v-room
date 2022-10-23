import type { NextPage } from "next";
import Head from "next/head";
import Header from "../../components/header"
import Footer from "../../components/footer"
import { getAllClassrooms } from "../api/classrooms";
import type { Classroom } from '@prisma/client';
import React, { useCallback, useEffect } from "react";
import { useRouter } from 'next/router'

type PageProps = {
  data: Classroom[];
}

const ClassroomList: NextPage<PageProps> = ({ data }) => {
  const router=useRouter();
  const [classrooms, setClassrooms] = React.useState(data);
  const [show, setShow]  = React.useState(false);
  const [newName, setNewName]  = React.useState("");
  const [newPronoun, setNewPronoun]  = React.useState("");
  const [error, setError] = React.useState(false);
 const handleSubmit = useCallback(async(e:any) =>
  {
    console.log("adding user");
 
    const email:any=document.getElementsByClassName('email')[0]?.innerHTML;
    console.log("qqqqq ",email);
    const created = await fetch('../api/user/update', {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        data:{
          "name": newName,
          "pronoun": newPronoun,
          "isRegistered":true
        },
        email
      
      })
    });
    if(created.status == 200) {
      alert('Registration Successful')
      // const res = await fetch('../api/classrooms/', {
      //   method: 'GET'
      // });
      // const newClassrooms = await res.json();
      // setClassrooms(newClassrooms.classrooms);
      router.push('/user/profile');
    }
    else {
      setError(true);
      console.log(created);
    }

  },[])

  useEffect(() => {
    // Prefetch the dashboard page
    router.prefetch('/user/profile')
  }, [])

  function showModal() {
    setShow(true);
  }
  
function formCompleted() {
  return newName == "" || newPronoun == "" ;
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
          {/* <h1 className="text-lg leading-normal p-4">
            <span className="text-red-500">Your Classrooms</span>
          </h1>
          <ClassroomTable classrooms={classrooms}></ClassroomTable> */}
          <button onClick={showModal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 m-4 rounded">Register</button>
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
                        User Registration Information.
                    </p>
                </div>
                <div className="pr-6 pl-6 pb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} type="text" name="name" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="Enter your Full Name"></input>
                </div>
                <div className="pr-6 pl-6 pb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-900">Pronoun</label>
                  <input value={newPronoun} onChange={e => setNewPronoun(e.target.value)} type="text" name="pronoun" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="Enter Pronoun"></input>
                </div>
                <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-600">
                    <button disabled={formCompleted()} onClick={handleSubmit} type="button" className="focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-grey-200 disabled:text-grey:600 bg-red-500 hover:bg-red-700 text-white focus:ring-red-300">Register as User</button>
                    <button onClick={() => {setShow(false); setError(false)}} type="button" className="focus:ring-4 focus:outline-none rounded-lg border text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 bg-gray-700 text-gray-300 border-gray-500 hover:text-white hover:bg-gray-600 focus:ring-gray-600">Close</button>
                </div>
                {error &&
                <div>
                  Error Registering to V-Room.
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