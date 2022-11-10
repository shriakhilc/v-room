import { trpc } from "@/src/utils/trpc";
import { UserRole } from '@prisma/client';
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "../../../components/footer";
import Header from "../../../components/header";

const JoinClassroomPage: NextPage = () => {
  const { data, status } = useSession();
  const router = useRouter();
  const inviteCode = router.query.inviteCode as string;

  const { data: classroom, status: classroomStatus } = trpc.useQuery(['classroom.byInviteCode', { inviteCode: inviteCode }],
    {
      enabled: router.query.inviteCode != undefined,
    }
  );

  const { data: currentRelationship, status: currentRelationshipStatus } = trpc.useQuery(['userOnClassroom.byClassroomAndUserId', { classroomId: classroom?.id as string, userId: data?.user?.id as string }],
    {
      enabled: data?.user?.id != undefined && classroom != undefined,
    }
  );

  if (status == "authenticated" && classroom && currentRelationship) {
    router.push('/classroom/' + classroom.id);
  }

  const addUserToClassroom = trpc.useMutation('userOnClassroom.create');

  async function joinClassroom() {
    await addUserToClassroom.mutateAsync(
      {
        classroomId: classroom?.id as string,
        userId: data?.user?.id as string,
        role: UserRole.STUDENT,
      },
      {
        onSuccess: () => router.push('/classroom/' + classroom?.id),
        onError(error) {
          console.log(`userTable: ERROR: ${error}`);
        },
      }
    );
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

        {(status == "authenticated" && classroom && !currentRelationship) &&
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

export default JoinClassroomPage;