import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";

const MeetingParticipant = dynamic(() => import('@/components/meeting_participant'), {
    ssr: false,
})

const anonName = `Guest ${Math.floor(Math.random() * 1000) + 1}`;

const JoinMeeting: NextPage = () => {

    const { status: sessionStatus, data: session } = useSession();

    const { isReady, query } = useRouter();

    return (
        <>
            <Head>
                <title>Office Hours</title>
                <meta name="description" content="In room" />
                <link rel="icon" href="/favicon.svg" />
            </Head>

            {isReady && typeof query.hostId === "string" &&
                <MeetingParticipant hostId={query.hostId} currUserName={session?.user?.name ?? anonName} />}
        </>
    )
}

export default JoinMeeting;