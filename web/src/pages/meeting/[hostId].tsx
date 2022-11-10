import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";

const MeetingParticipant = dynamic(() => import('@/components/meeting_participant'), {
    ssr: false,
})

const JoinMeeting: NextPage = () => {

    // TODO: Add session

    const { isReady, query } = useRouter();

    return (
        <>
            <Head>
                <title>Office Hours</title>
                <meta name="description" content="In room" />
                <link rel="icon" href="/favicon.svg" />
            </Head>
            {isReady && typeof query.hostId === "string" && <MeetingParticipant hostid={query.hostId} />}
        </>
    )
}

export default JoinMeeting;