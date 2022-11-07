import type { NextPage } from "next";
import Head from "next/head";
import dynamic from 'next/dynamic'
import { useRouter } from "next/router";

const MeetingHost = dynamic(() => import('@/components/meeting_host'), {
    ssr: false,
})

const HostMeeting: NextPage = () => {

    // TODO: Add session

    const { isReady, query } = useRouter();

    return (
        <>
            <Head>
                <title>Office Hours</title>
                <meta name="description" content="Hosting room" />
                <link rel="icon" href="/favicon.svg" />
            </Head>
            {isReady && typeof query.classroomid === "string" && <MeetingHost classroomid={query.classroomid} />}
        </>
    )
};

export default HostMeeting;