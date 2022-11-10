import LocalStreamManager from '@/src/components/local_stream_manager';
import ParticipantStream from '@/src/components/participant_stream';
import Peer, { DataConnection } from 'peerjs';
import { useCallback, useEffect, useState } from 'react';
import { ChatMessage, DataEvent, DataPayload, ParticipantInfo } from '../utils/meetings';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';
import ParticipantDisplay from './ParticipantDisplay';

const peer = new Peer();

export default function MeetingHost(props: { classroomid: string; }) {
    const [hostId, setHostId] = useState('')
    //const [dataConnections, setDataConnections] = useState<DataConnection[]>([]);
    //const [mediaConnections, setMediaConnections] = useState<MediaConnection[]>([]);
    // Maintains order of insertion by default
    const [participantMap, setPartipantMap] = useState<Map<string, ParticipantInfo>>(new Map());
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
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

                // Creates new shallow Map using prev map + new conn
                setPartipantMap((prev) => (
                    new Map(
                        prev.set(conn.peer, {
                            name: conn.metadata.name,
                            dataConn: conn,
                        })
                    )
                ));
            };

            peer.on('connection', onNewConnection);

            // unsubscribe this specific listener
            return () => {
                peer.off('connection', onNewConnection);
            }
        },
        []
    );

    const callParticipant = useCallback(
        (participantInfo: ParticipantInfo) => {
            if (localStream != null) {
                const peerId = participantInfo.dataConn.peer;
                console.log(`Calling ${peerId}`);

                setPartipantMap((prev) => (
                    new Map(
                        prev.set(peerId, {
                            ...participantInfo,
                            mediaConn: peer.call(peerId, localStream),
                        })
                    )
                ));
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

            // Sending to only those who joined the meeting, not those in waiting room
            participantMap.forEach(({ dataConn, mediaConn }) => {
                if (mediaConn !== undefined) {
                    dataConn.send(payload);
                }
            });
            setMessages(m => [...m, payload.data])
        },
        [participantMap]
    );


    return (
        <main className="container mx-auto flex flex-row h-screen w-screen max-h-screen">
            <div className='flex flex-col grow'>
                <div id="video_grid" className='flex flex-row flex-wrap overflow-auto grow gap-1 p-1 justify-evenly content-start'>
                    <LocalStreamManager localStream={localStream} setLocalStream={setLocalStream} host classroomid={props.classroomid} peerid={hostId} />
                    {Array.from(participantMap, ([peerId, { mediaConn }]) => (
                        (mediaConn !== undefined) &&
                        <ParticipantStream key={peerId} peer={peer} peerid={peerId} localStream={localStream} call={mediaConn} />
                    ))}
                </div>

                <div id="bottom_controls" className='shrink-0 basis-1/6'></div>
            </div>

            <div id="sidebar" className='flex flex-col px-2 divide-y divide-solid divide-gray-500 space-y-2 h-full basis-1/4'>
                {/* overflow-x-hidden needed because btn transition animation overflows x and briefly displays scrollbar */}
                <div id="participants" className='flex flex-col grow overflow-y-auto overflow-x-hidden'>
                    <p className='text-lg font-semibold'>Participants ({participantMap.size})</p>

                    <div className='flex flex-col grow overflow-y-auto'>
                        {Array.from(participantMap, ([peerId, participantInfo]) => (
                            <ParticipantDisplay key={peerId} info={participantInfo} answerCall={() => callParticipant(participantInfo)}></ParticipantDisplay>
                        ))}
                    </div>

                    {/* <p>Host ID: {hostId}</p> */}
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