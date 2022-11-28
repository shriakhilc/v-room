import LocalStreamManager from '@/src/components/local_stream_manager';
import { Session } from 'next-auth';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { useCallback, useEffect, useState } from 'react';
import { ChatMessage, DataEvent, DataPayload, ParticipantInfo } from '../utils/meetings';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';
import ParticipantDisplay from './ParticipantDisplay';
import ParticipantStream from './participant_stream';

const peer = new Peer();

interface MeetingParticipantProps {
    hostId: string,
    session: Session | null,
}

export default function MeetingParticipant({ hostId, session }: MeetingParticipantProps) {
    const [peerId, setPeerId] = useState('')
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [participantMap, setParticipantMap] = useState<Map<string, ParticipantInfo>>(new Map());

    const copyInviteLink = useCallback(
        () => { navigator.clipboard.writeText(`${window.location.origin}/meeting/${hostId}`) },
        [hostId]
    );

    const onNewConnection = useCallback(
        (conn: DataConnection) => {
            // Note: conn.peer is available even if conn isn't open yet
            conn.on("data", (data) => {
                console.log(`Received: ${JSON.stringify(data)}`);
                const payload = data as DataPayload;
                switch (payload.event) {
                    case DataEvent.CHAT_MESSAGE: {
                        setMessages(prev => [...prev, payload.data as ChatMessage]);
                        break;
                    }

                    default: {
                        // Do nothing on unknown events
                        console.error(`Unknown event received: ${JSON.stringify(payload)}`);
                        break;
                    }
                }
            });

            conn.on("open", () => {
                const payload: DataPayload = {
                    event: DataEvent.CHAT_MESSAGE,
                    data: {
                        senderName: session?.user?.name ?? "Guest",
                        timestamp: Date.now(),
                        message: 'hi!'
                    },
                };
                conn.send(payload);
                console.log("Message sent to host");
                setMessages(m => [...m, (payload.data as ChatMessage)]);
            });

            conn.on('close', () => {
                // Remove participant from map
                console.log(`Closing data conn ${conn.peer}`);
                setParticipantMap((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(conn.peer);
                    return newMap;
                });
            })

            // Creates new shallow Map using prev map + new conn
            setParticipantMap((prev) => (
                new Map(
                    prev.set(conn.peer, {
                        name: conn.metadata.name,
                        dataConn: conn,
                    })
                )
            ));
        },
        [session]
    );

    useEffect(
        () => {
            peer.on('connection', onNewConnection);
            console.log("Connection listener set");

            // unsubscribe this specific listener
            return () => {
                peer.off('connection', onNewConnection);
                console.log("Connection listener unsubscribed");
            }
        },
        [onNewConnection]
    );

    useEffect(
        () => {
            const onPeerOpen = (id: string) => {
                console.log("My participant ID is: " + id);
                console.log("joining host" + hostId + " with id " + id);

                const hostConn = peer.connect(hostId, { metadata: { name: session?.user?.name ?? "Guest" } });
                // manual call needed since our connection doesn't trigger event
                onNewConnection(hostConn);

                setPeerId(id);
            };
            peer.on('open', onPeerOpen);
            // unsubscribe this specific listener
            return () => {
                peer.off('open', onPeerOpen);
            }
        },
        [hostId, session, onNewConnection]
    );

    useEffect(
        () => {
            // TODO: Prevent this during waiting room
            // TODO: Add condition to check against host's peer map while in meeting
            const onCallReceived = (call: MediaConnection) => {
                // participants will auto-answer any calls they receive
                call.answer(localStream ?? undefined);

                setParticipantMap((prev) => {
                    const participantInfo = prev.get(call.peer);
                    // if peer is a known connection 
                    if (participantInfo !== undefined) {
                        return new Map(
                            prev.set(call.peer, {
                                ...participantInfo,
                                mediaConn: call,
                            })
                        );
                    }
                    return prev;
                });
            }
            peer.on('call', onCallReceived);
            // unsubscribe this specific listener
            return () => {
                peer.off('call', onCallReceived);
            }
        },
        [localStream]
    );

    // const closeHostConn = useCallback(
    //     () => {
    //         if (hostConn !== undefined) {
    //             console.log(`Closing connection with host ${hostConn.peer}`);
    //             hostConn.close();
    //         }
    //     },
    //     [hostConn]
    // );

    const sendMessageToAll = useCallback(
        (msg: string) => {
            const payload: DataPayload = {
                event: DataEvent.CHAT_MESSAGE,
                data: {
                    senderName: session?.user?.name ?? "Guest",
                    timestamp: Date.now(),
                    message: msg,
                },
            };

            // participant only knows people in meeting, none in waiting room
            // so send to all.
            participantMap.forEach(({ dataConn, mediaConn }) => {
                dataConn.send(payload);
            });
            setMessages(m => [...m, payload.data as ChatMessage])
        },
        [participantMap, session]
    );


    return (
        <main className="container mx-auto flex flex-row h-screen w-screen max-h-screen">
            <div className='flex flex-col grow'>
                <div id="video_grid" className='flex flex-row flex-wrap overflow-auto grow gap-1 p-1 justify-evenly content-start'>
                    <LocalStreamManager localStream={localStream} setLocalStream={setLocalStream} />
                    {/* <HostStream peer={peer} peerid={hostId} localStream={localStream} /> */}
                    {Array.from(participantMap, ([peerId, { mediaConn }]) => (
                        (mediaConn !== undefined) &&
                        <ParticipantStream key={peerId} call={mediaConn} />
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
                            <ParticipantDisplay key={peerId} info={participantInfo} answerCall={() => { return; }} host={false}></ParticipantDisplay>
                        ))}
                    </div>

                    {/* <p>Participant ID: {peerId}</p> */}
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