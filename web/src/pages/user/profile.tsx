import type { NextPage } from "next";
import Head from "next/head";
import Header from "../../components/header"
import Footer from "../../components/footer"
import React, { useCallback } from "react";
import { useRouter } from 'next/router'
import { useSession } from "next-auth/react";
import { trpc } from "@/src/utils/trpc";

const UserProfile: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [show, setShow] = React.useState(false);
  const [newName, setNewName] = React.useState(session?.user?.name ?? "");
  // TODO: Include pronoun or getUser
  const [newPronoun, setNewPronoun] = React.useState(session?.user?.pronouns ?? "");
  const [error, setError] = React.useState(false);

  const updateUser = trpc.useMutation('user.update');

  const handleSubmit = useCallback(
    async () => {
      if (session?.user?.id == undefined) {
        return;
      }

      await updateUser.mutateAsync(
        {
          id: session.user.id,
          data: {
            name: newName,
            pronouns: newPronoun,
          }
        },
        {
          onSuccess: () => router.push('/classroom/list'),
          onError(error) {
            console.log(`/user/profile: ERROR: ${error}`);
            setError(true);
          },
        }
      );
    },
    [newName, newPronoun, session, router, updateUser]
  );

  function showModal() {
    setShow(true);
  }

  function formCompleted() {
    return newName == "" || newPronoun == "";
  }

  return (
    <>
      <div className="container mx-auto">
        <Head>
          <title>V-Room</title>
          <meta name="description" content="Reimagining Office Hours" />
          <link rel="icon" href="/favicon.svg" />
        </Head>

        <Header session={session} status={status}></Header>

        <main className="container mx-auto h-5/6 flex flex-col items-left p-4">
          <button onClick={showModal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 m-4 rounded"> {router.query.newUser === "true" ? "Complete registration" : "Update profile"} </button>
          {show &&
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
                    Update Profile
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <p className="text-base leading-relaxed text-gray-900">
                    User Profile Information.
                  </p>
                </div>
                <div className="pr-6 pl-6 pb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="name">Name</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="Enter your Full Name"></input>
                </div>
                <div className="pr-6 pl-6 pb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="pronoun">Pronouns</label>
                  <input value={newPronoun} onChange={e => setNewPronoun(e.target.value)} type="text" name="pronoun" id="pronoun" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5" placeholder="Enter Pronouns"></input>
                </div>
                <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-600">
                  <button disabled={formCompleted()} onClick={handleSubmit} type="button" className="focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-grey-200 disabled:text-grey:600 bg-red-500 hover:bg-red-700 text-white focus:ring-red-300"> {router.query.newUser === "true" ? "Complete registration" : "Update profile"} </button>
                  <button onClick={() => { setShow(false); setError(false) }} type="button" className="focus:ring-4 focus:outline-none rounded-lg border text-sm font-medium px-5 py-2.5 focus:z-10 bg-gray-700 text-gray-300 border-gray-500 hover:text-white hover:bg-gray-600 focus:ring-gray-600">Close</button>
                </div>
                {error &&
                  <div>
                    Error Registering to V-Room.
                  </div>}
              </div>
            </div>}
        </main>


        <Footer></Footer>
      </div>
    </>
  );
};

export default UserProfile;