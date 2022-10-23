import type { NextPage } from "next";
import Head from "next/head";
import dynamic from 'next/dynamic'

const MeetingHost = dynamic(() => import('@/components/meeting_host'), {
    ssr: false,
})

const HostMeeting: NextPage = () => {

    return (
        <>
            <Head>
                <title>Office Hours</title>
                <meta name="description" content="Hosting room" />
                <link rel="icon" href="/favicon.svg" />
            </Head>
            <MeetingHost />
        </>
    )
};

export default HostMeeting;