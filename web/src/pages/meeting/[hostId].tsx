import type { NextPage } from "next";
import { useRouter } from "next/router"
import Head from "next/head";
import dynamic from "next/dynamic";

const MeetingParticipant = dynamic(() => import('@/components/meeting_participant'), {
    ssr: false,
})

const JoinMeeting: NextPage = () => {

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