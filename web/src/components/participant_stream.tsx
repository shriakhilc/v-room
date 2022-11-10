import Peer, { MediaConnection } from 'peerjs';
import { useRef, useState } from 'react';

export default function ParticipantStream(props: {
    call: MediaConnection | undefined;
    peer: Peer;
    peerid: string | undefined;
    localStream: MediaStream | null;
}) {
    const [participantStream, setParticipantStream] = useState<MediaStream | null>(null);

    const [remoteAudio, setRemoteAudio] = useState(true);
    const [remoteVideo, setRemoteVideo] = useState(true);

    const remoteStreamView = useRef<HTMLVideoElement | null>(null);

    if (props.peerid !== undefined && props.localStream !== null) {
        if (props.call !== undefined) {
            props.call.on("stream", (remoteStream: MediaStream | null) => {
                if (remoteStreamView?.current !== null && remoteStream !== null) {
                    remoteStreamView.current.srcObject = remoteStream;
                    console.log("displaying participant stream")
                }
                setParticipantStream(remoteStream);
                console.log("set participant stream")
            });
        }
    }

    function toggleRemoteAudio(stream: MediaStream | null, enabled?: boolean) {
        let current = remoteAudio
        if (enabled !== undefined) {
            setRemoteAudio(enabled)
        } else {
            current = !current
        }
        setRemoteAudio(current)
        if (stream !== null) {
            stream.getAudioTracks().forEach((track) => track.enabled = current)
        }
    }

    function toggleRemoteVideo(stream: MediaStream | null, enabled?: boolean) {
        let current = remoteVideo
        if (enabled !== undefined) {
            current = enabled
        } else {
            current = !current
        }
        setRemoteVideo(current)
        if (stream !== null) {
            stream.getVideoTracks().forEach((track) => track.enabled = current)
        }
    }

    return (
        <>
            <div className="bg-black">
                <video className="card w-[480px]" ref={remoteStreamView} autoPlay playsInline></video>
                <div className="button-group">
                    <button className={remoteAudio ? "btn btn-success" : "btn btn-error"} onClick={() => toggleRemoteAudio(participantStream)}>Toggle Sound</button>
                    <button className={remoteVideo ? "btn btn-success" : "btn btn-error"} onClick={() => toggleRemoteVideo(participantStream)}>Toggle Video</button>
                </div>
            </div>
        </>
    )
}