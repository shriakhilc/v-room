import Peer from 'peerjs';
import { useState } from 'react';
import LocalStreamManager from '@/src/components/local_stream_manager';
import HostStream from '@/src/components/host_stream';
import { DataEvent, DataPayload } from '../utils/meetings';
const peer = new Peer();

export default function MeetingParticipant(props: { hostid: string | undefined; }) {
    const [peerid, setPeerid] = useState('')
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    peer.on('open', (id) => {
        console.log("My participant ID is: " + id);

        console.log("host id" + props.hostid)
        if (props.hostid !== undefined) {
            console.log("joining host" + props.hostid + " with id " + id)

            // TODO: Turn metadata into interface
            const conn = peer.connect(props.hostid, { metadata: { name: "Participant A" } });

            conn.on("open", () => {
                const payload: DataPayload = {
                    event: DataEvent.CHAT_MESSAGE,
                    data: {
                        senderName: "Participant",
                        timestamp: Date.now(),
                        message: 'hi!'
                    },
                };
                conn.send(payload);
            });
        }

        setPeerid(id);
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