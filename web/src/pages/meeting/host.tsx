import type { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { DataConnection } from "peerjs";

const HostMeeting: NextPage = () => {
    
    useEffect(() => {
        import('peerjs').then(({ default: Peer }) => {
            const peer = new Peer();
            peer.on('open', (id) => {
                console.log("My peer ID is: " + id);
            });
            peer.on("connection", (conn: DataConnection) => {
                conn.on("data", (data) => {
                    // Will print 'hi!'
                    console.log("from " + conn.peer + " " + data);

                });
                conn.on("open", () => {
                    conn.send("hello!");
                });
            });
        });
    })

    return (
        <>
            <Head>
                <title>Office Hours</title>
                <meta name="description" content="Hosting room" />
                <link rel="icon" href="/favicon.svg" />
            </Head>
        </>
    )
};

export default HostMeeting;