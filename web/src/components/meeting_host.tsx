import Link from 'next/link';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { useState } from 'react';
import LocalStreamManager from '@/src/components/local_stream_manager';
import ParticipantStream from '@/src/components/participant_stream';
const peer = new Peer();

export default function MeetingHost() {
    const [peerid, setPeerid] = useState('')
    const [peers, setPeers] = useState<string[]>([]);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [call, setCall] = useState<MediaConnection | undefined>(undefined);
    peer.on('open', (id) => {
        console.log("My peer ID is: " + id);
        setPeerid(id);
    });
    peer.on("connection", (conn: DataConnection) => {
        conn.on("data", (data) => {
            console.log("from " + conn.metadata?.name + " at " + conn.peer + " " + data);
            setPeers([...peers, conn.peer]);
        });
        conn.on("open", () => {
            conn.send("hello!");
        });
    });

    console.log("peers " + peers.length)
    function callParticipant(participant_idx: number) {
        const to_call = peers[participant_idx]
        if (to_call !== undefined && localStream != null) {
            setCall(peer.call(to_call, localStream));
            console.log("calling " + to_call);
        }
    }

    return (
        <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
            <p>{"Host ID: " + peerid}</p>
            <Link href={"/meeting/join?hostid=" + peerid}> join meeting data channel</Link>
            <button className="btn" onClick={() => callParticipant(0)}>Start Call</button>
            <br />
            <div className="">
                <ParticipantStream peer={peer} peerid={peers[0]} localStream={localStream} call={call} />
                <div className="absolute bottom-0 left-0">
                    <LocalStreamManager localStream={localStream} setLocalStream={setLocalStream} host/>
                </div>
            </div>
            <p>Participants: </p>
            <div>
                {peers.map(function (x, i) {
                    return <li key={i}>{x}</li>;
                })}
            </div>

        </main>
    )
}