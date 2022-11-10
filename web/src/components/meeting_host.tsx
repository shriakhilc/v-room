import LocalStreamManager from '@/src/components/local_stream_manager';
import ParticipantStream from '@/src/components/participant_stream';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { useCallback, useEffect, useState } from 'react';
import MeetingParticipant from './meeting_participant';
import MessageDisplay, { ChatMessage, DataEvent, DataPayload } from './MessageDisplay';
import MessageInput from './MessageInput';
import ParticipantDisplay from './ParticipantDisplay';

const peer = new Peer();

export default function MeetingHost(props: { classroomid: string; }) {
    const [hostId, setHostId] = useState('')
    const [dataConnections, setDataConnections] = useState<DataConnection[]>([]);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    // TODO: Call[]
    const [call, setCall] = useState<MediaConnection | undefined>(undefined);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const copyInviteLink = useCallback(
        () => { navigator.clipboard.writeText(`${window.location.origin}/meeting/${hostId}`) },
        [hostId]
    );

    useEffect(
        () => {
            const onPeerOpen = (id: string) => {
                console.log("My peer ID is: " + id);
                setHostId(id);
            };
            peer.on('open', onPeerOpen);
            // unsubscribe this specific listener
            return () => {
                peer.off('open', onPeerOpen);
            }
        },
        []
    );

    useEffect(
        () => {
            const onNewConnection = (conn: DataConnection) => {
                // Note: conn.peer is available even if conn isn't open yet
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

                conn.on("open", () => {
                    // Auto sending a message to every new connection
                    const payload: DataPayload = {
                        event: DataEvent.CHAT_MESSAGE,
                        data: {
                            senderName: "Meeting Host",
                            timestamp: Date.now(),
                            message: "hello!"
                        },
                    };

                    conn.send(payload);
                    setMessages(m => [...m, payload.data])
                });

                // TODO: Use a better structure for updates (maybe queue with auxiliary set)
                setDataConnections([...dataConnections, conn]);
            };

            peer.on('connection', onNewConnection);

            // unsubscribe this specific listener
            return () => {
                peer.off('connection', onNewConnection);
            }
        },
        [dataConnections]
    );

    const callParticipant = useCallback(
        (conn: DataConnection) => {
            if (localStream != null) {
                console.log(`Calling ${conn.peer}`);
                setCall(peer.call(conn.peer, localStream));
            }
        },
        [localStream]
    );

    const sendMessageToAll = useCallback(
        (msg: string) => {
            // TODO: Get user's name here
            const payload: DataPayload = {
                event: DataEvent.CHAT_MESSAGE,
                data: {
                    senderName: "Meeting Host",
                    timestamp: Date.now(),
                    message: msg,
                },
            };

            // Sending to everyone in the meeting
            // TODO: This shouldn't go to those who haven't been added in yet
            dataConnections.forEach((conn: DataConnection) => {
                conn.send(payload);
            });
            setMessages(m => [...m, payload.data])
        },
        [dataConnections]
    );


    return (
        <main className="container mx-auto flex flex-row h-screen w-screen max-h-screen">
            <div className='flex flex-col grow'>
                <div id="video_grid" className='flex flex-row flex-wrap overflow-auto grow gap-1 p-1 justify-evenly content-start'>
                    <LocalStreamManager localStream={localStream} setLocalStream={setLocalStream} host classroomid={props.classroomid} peerid={hostId} />
                    {dataConnections.map((conn: DataConnection) => (
                        call !== undefined &&
                        <ParticipantStream peer={peer} peerid={conn.peer} localStream={localStream} call={call} />
                    ))}
                </div>

                <div id="bottom_controls" className='shrink-0 basis-1/6'></div>
            </div>

            <div id="sidebar" className='flex flex-col px-2 divide-y divide-solid divide-gray-500 space-y-2 h-full basis-1/4'>
                {/* overflow-x-hidden needed because btn transition animation overflows x and briefly displays scrollbar */}
                <div id="participants" className='flex flex-col grow overflow-y-auto overflow-x-hidden'>
                    <p className='text-lg font-semibold'>Participants ({dataConnections.length})</p>

                    <div className='flex flex-col grow overflow-y-auto'>
                        {dataConnections.map((conn: DataConnection) => (
                            <ParticipantDisplay key={conn.peer} name={conn.metadata.name} answerCall={() => callParticipant(conn)}></ParticipantDisplay>
                        ))}
                    </div>

                    {/* TODO: Remove direct URL display */}
                    <p>Host ID: {hostId}</p>
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
    )
}