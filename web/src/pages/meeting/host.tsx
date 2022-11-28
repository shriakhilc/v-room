import type { NextPage } from "next";
import Head from "next/head";
import dynamic from 'next/dynamic'
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const MeetingHost = dynamic(() => import('@/components/meeting_host'), {
    ssr: false,
})

const HostMeeting: NextPage = () => {

    const { status: sessionStatus, data: session } = useSession();

    const { isReady, query } = useRouter();

    return (
        <>
            <Head>
                <title>Office Hours</title>
                <meta name="description" content="Hosting room" />
                <link rel="icon" href="/favicon.svg" />
            </Head>
            {isReady && typeof query.classroomid === "string"
                && sessionStatus === "authenticated" &&
                <MeetingHost classroomid={query.classroomid} currUserName={session.user?.name ?? "Meeting Host"} />}
        </>
    )
};

export default HostMeeting;