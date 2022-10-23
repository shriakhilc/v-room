import Peer from 'peerjs';
import { useState } from 'react';
import LocalStreamManager from '@/src/components/local_stream_manager';
import HostStream from '@/src/components/host_stream';
const peer = new Peer();

export default function MeetingParticipant(props: { hostid: string | undefined; }) {
    const [peerid, setPeerid] = useState('')
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    peer.on('open', (id) => {
        console.log("My participant ID is: " + id);
        setPeerid(id);
        console.log("host id" + props.hostid)
        if (props.hostid !== undefined) {
            console.log("joining host" + props.hostid + " with id " + id)
            const conn = peer.connect(props.hostid, { metadata: { name: "Participant A" } });
            conn.on("open", () => {
                conn.send("hi!");
            });
        }
    });

    return (
        <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
            <p>{"Participant ID: " + peerid}</p>
            <br />
            <LocalStreamManager localStream={localStream} setLocalStream={setLocalStream} />
            <HostStream peer={peer} peerid={props.hostid ? props.hostid : undefined} localStream={localStream} />
        </main>
    )
}