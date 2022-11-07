import LocalStreamManager from '@/src/components/local_stream_manager';
import ParticipantStream from '@/src/components/participant_stream';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { useCallback, useState } from 'react';

const peer = new Peer();

export default function MeetingHost(props: { classroomid: string; }) {
    const [peerid, setPeerid] = useState('')
    const [peers, setPeers] = useState<string[]>([]);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [call, setCall] = useState<MediaConnection | undefined>(undefined);

    const onPeerOpen = useCallback(
        (id: string) => {
            console.log("My peer ID is: " + id);
            setPeerid(id);
        },
        []
    );

    const onNewConnection = useCallback(
        (conn: DataConnection) => {
            console.log(`onNewConnection: From ${conn.peer} is${conn.open ? 'open' : 'not open'}`);
            conn.on("data", (data) => {
                console.log("from " + conn.metadata?.name + " at " + conn.peer + " " + data);
                setPeers([...peers, conn.peer]);
            });
            conn.on("open", () => {
                conn.send("hello!");
            });
        },
        [peers]
    );

    const copyInviteLink = useCallback(
        () => { navigator.clipboard.writeText(`${window.location.origin}/meeting/${peerid}`) },
        [peerid]
    );

    peer.on('open', onPeerOpen);
    peer.on('connection', onNewConnection);

    console.log("peers " + peers.length)
    function callParticipant(participant_idx: number) {
        const to_call = peers[participant_idx]
        if (to_call !== undefined && localStream != null) {
            setCall(peer.call(to_call, localStream));
            console.log("calling " + to_call);
        }
    }

    return (
        <main className="container mx-auto flex flex-row h-screen w-screen">
            <div className='flex flex-col grow'>
                <div id="video_grid" className='flex flex-row flex-wrap bg-rose-500 overflow-auto grow gap-1 p-1 justify-evenly content-start'>
                    <LocalStreamManager localStream={localStream} setLocalStream={setLocalStream} host classroomid={props.classroomid} peerid={peerid} />
                    <ParticipantStream peer={peer} peerid={peers[0]} localStream={localStream} call={call} />
                </div>

                <div id="bottom_controls" className='bg-green-500 shrink-0 basis-1/6'></div>
            </div>

            <div id="sidebar" className='flex flex-col shrink-0 basis-1/4 divide-y divide-solid divide-gray-500 space-y-2'>
                <div id="participants" className='flex flex-col basis-1/2 pb-1'>
                    <p className='text-lg font-semibold'>Participants</p>
                    <ul className='list-none list-inside grow overflow-auto'>
                        {peers.map((participant_id, idx) => (
                            <li key={idx}>{participant_id}</li>
                        ))}
                    </ul>
                    {/* TODO: Remove direct URL display */}
                    <p>Host ID: {peerid}</p>
                    <div className='flex flex-row justify-evenly'>
                        <button onClick={copyInviteLink}
                            className="btn normal-case p-1 bg-transparent border border-white hover:border-white border-solid hover:bg-gray-700"
                        >
                            Copy Invite Link
                        </button>
                        <button onClick={() => callParticipant(0)}
                            className="btn normal-case p-1 bg-transparent border border-white hover:border-white border-solid hover:bg-gray-700"
                        >
                            Bring Student In
                        </button>
                    </div>
                </div>
                <div id="chat" className='basis-1/2 overflow-auto'>
                    <p className='text-lg mt-2 font-semibold'>Chat</p>
                </div>
            </div>
        </main>
    )
}