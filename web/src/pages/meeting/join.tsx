import type { NextPage } from "next";
import { useRouter } from "next/router"
import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
            {isReady && typeof query.hostid === "string" && <MeetingParticipant hostid={query.hostid} />}
        </>
    )
}

export default JoinMeeting;