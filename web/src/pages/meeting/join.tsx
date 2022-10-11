import type { NextPage } from "next";
import { useRouter } from "next/router"
import Head from "next/head";
import { useEffect } from "react";

const JoinMeeting: NextPage = () => {

    const { isReady, query } = useRouter();

    useEffect(() => {
        if (isReady) {
            import('peerjs').then(({ default: Peer }) => {
                const peer = new Peer();
                peer.on('open', (id) => {
                    if (typeof query.hostid === "string") {
                        console.log("joining host" + query.hostid + " with id " + id)
                        const conn = peer.connect(query.hostid);
                        conn.on("open", () => {
                            conn.send("hi!");
                        });
                    }
                });
            });
        }
    }, [isReady, query.hostid])

    return (
        <>
            <Head>
                <title>Office Hours</title>
                <meta name="description" content="In room" />
                <link rel="icon" href="/favicon.svg" />
            </Head>
        </>
    )
};

export default JoinMeeting;