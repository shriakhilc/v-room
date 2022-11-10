import HostStream from '@/src/components/host_stream';
import LocalStreamManager from '@/src/components/local_stream_manager';
import Peer, { DataConnection } from 'peerjs';
import { useCallback, useEffect, useState } from 'react';
import { ChatMessage, DataEvent, DataPayload } from '../utils/meetings';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';

const peer = new Peer();

interface MeetingParticipantProps {
    hostid: string,
}

export default function MeetingParticipant({ hostid }: MeetingParticipantProps) {
    const [peerId, setPeerId] = useState('')
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [hostConn, setHostConn] = useState<DataConnection>();
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const copyInviteLink = useCallback(
        () => { navigator.clipboard.writeText(`${window.location.origin}/meeting/${hostid}`) },
        [hostid]
    );

    useEffect(
        () => {
            const onPeerOpen = (id: string) => {
                console.log("My participant ID is: " + id);
                console.log("joining host" + hostid + " with id " + id)

                // TODO: Turn metadata into interface
                const conn = peer.connect(hostid, { metadata: { name: "Participant A" } });

                conn.on("data", (data) => {
                    const payload = data as DataPayload;
                    switch (payload.event) {
                        case DataEvent.CHAT_MESSAGE: {
                            setMessages(prev => [...prev, payload.data]);
                            break;
                        }

                        default: {
                            // Do nothing on unknown events
                            console.error(`Unknown event received: ${data}`);
                            break;
                        }
                    }
                });

                conn.on('close', () => {
                    console.log(`Closing data conn with host ${conn.peer}`);
                })

                conn.on("open", () => {
                    const payload: DataPayload = {
                        event: DataEvent.CHAT_MESSAGE,
                        data: {
                            senderName: "Participant A",
                            timestamp: Date.now(),
                            message: 'hi!'
                        },
                    };
                    conn.send(payload);
                    setMessages(m => [...m, payload.data]);
                });

                setPeerId(id);
                setHostConn(conn);
            };
            peer.on('open', onPeerOpen);
            // unsubscribe this specific listener
            return () => {
                peer.off('open', onPeerOpen);
            }
        },
        [hostid]
    );

    const closeHostConn = useCallback(
        () => {
            if (hostConn !== undefined) {
                console.log(`Closing connection with host ${hostConn.peer}`);
                hostConn.close();
            }
        },
        [hostConn]
    );

    const sendMessageToAll = useCallback(
        (msg: string) => {
            // TODO: Get user's name here
            const payload: DataPayload = {
                event: DataEvent.CHAT_MESSAGE,
                data: {
                    senderName: "Participant A",
                    timestamp: Date.now(),
                    message: msg,
                },
            };

            if (hostConn !== undefined) {
                hostConn.send(payload);
                setMessages(m => [...m, payload.data])
            }
        },
        [hostConn]
    );

    return (
        <main className="container mx-auto flex flex-row h-screen w-screen max-h-screen">
            <div className='flex flex-col grow'>
                <div id="video_grid" className='flex flex-row flex-wrap overflow-auto grow gap-1 p-1 justify-evenly content-start'>
                    <LocalStreamManager localStream={localStream} setLocalStream={setLocalStream} />
                    <HostStream peer={peer} peerid={hostid} localStream={localStream} />
                </div>

                <div id="bottom_controls" className='shrink-0 basis-1/6'></div>
            </div>

            <div id="sidebar" className='flex flex-col px-2 divide-y divide-solid divide-gray-500 space-y-2 h-full basis-1/4'>
                {/* overflow-x-hidden needed because btn transition animation overflows x and briefly displays scrollbar */}
                <div id="participants" className='flex flex-col grow overflow-y-auto overflow-x-hidden'>
                    {/* <p className='text-lg font-semibold'>Participants ({participantMap.size})</p>

                    <div className='flex flex-col grow overflow-y-auto'>
                        {Array.from(participantMap, ([peerId, participantInfo]) => (
                            <ParticipantDisplay key={peerId} info={participantInfo} answerCall={() => callParticipant(participantInfo)}></ParticipantDisplay>
                        ))}
                    </div> */}

                    <p>Participant ID: {peerId}</p>
                    <button onClick={copyInviteLink}
                        className="btn normal-case p-1 bg-transparent border border-white hover:border-white border-solid hover:bg-gray-700"
                    >
                        Copy Invite Link
                    </button>
                </div>

                <div id="chat" className='flex flex-col grow overflow-y-auto'>
                    <p className='text-lg mt-2 font-semibold'>Chat</p>
                    <div className='flex flex-col grow overflow-y-auto'>
                        {messages.map((msg) => (
                            <MessageDisplay key={`${msg.senderName}_${msg.timestamp}`} message={msg}></MessageDisplay>
                        ))}
                    </div>
                    <MessageInput onSend={sendMessageToAll}></MessageInput>
                </div>
            </div>
        </main>
    );
}