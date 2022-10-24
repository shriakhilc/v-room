import type { NextPage } from "next";
import Head from "next/head";
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

const Home: NextPage = () => {
  const { data, status } = useSession()

  return (
    <>
      <Head>
        <title>V-Room</title>
        <meta name="description" content="Reimagining Office Hours" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <nav>
        <p>
          {status == "authenticated" ?
            (
              <>
                <Link href="/user/profile">
                  <span
                    style={{ backgroundImage: `url(${data.user?.image})` }}
                    className="avatar"
                  />
                </Link>
                <span className="email">{data.user?.email}</span>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="signOutButton">Sign out</button>
              </>
            ) :
            (
              <button onClick={() => signIn('google', { callbackUrl: '/user/register' })} className="signInButton">Sign in</button>
            )
          }
        </p>
      </nav>

      <style jsx>{`
        header {
          border-bottom: 1px solid #ccc;
        }
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 42rem;
          margin: 0 auto;
          padding: 0.2rem 1.25rem;
        }
        .logo {
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .avatar {
          border-radius: 2rem;
          float: left;
          height: 2.2rem;
          width: 2.2rem;
          background-color: white;
          background-size: cover;
          border: 2px solid #ddd;
        }
        .email {
          margin-right: 1rem;
          margin-left: 0.25rem;
          font-weight: 600;
        }
        .signInButton,
        .signOutButton {
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          position: absolute;
          right:    0;
          top:   0;
        }
        .signInButton {
          background-color: #1eb1fc;
        }
        .signInButton:hover {
          background-color: #1b9fe2;
        }
        .signOutButton {
          background-color: #333;
        }
        .signOutButton:hover {
          background-color: #555;
        }
      `}</style>

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