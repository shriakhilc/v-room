import Peer from 'peerjs';
import { useRef, useState } from 'react';

export default function HostStream(props: { peer: Peer; peerid: string; localStream: MediaStream | null; }) {
    const [hostStream, setHostStream] = useState<MediaStream | null>(null);

    const [remoteAudio, setRemoteAudio] = useState(true);
    const [remoteVideo, setRemoteVideo] = useState(true);

    const remoteStreamView = useRef<HTMLVideoElement | null>(null);

    if (props.peerid !== undefined && props.localStream !== null) {
        props.peer.on("call", (call) => {
            call.answer(props.localStream ? props.localStream : undefined);
            console.log("answered call")
            call.on("stream", (remoteStream) => {
                if (remoteStreamView?.current !== null) {
                    remoteStreamView.current.srcObject = remoteStream;
                    console.log("displaying remote host stream")
                }
                setHostStream(remoteStream);
                console.log("set remote stream to host")
            });
        });
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
        <div>
            <div className="">
                <video className="card w-[480px]" ref={remoteStreamView} autoPlay playsInline></video>
                <div className="button-group">
                    <button className={remoteAudio ? "btn btn-success" : "btn btn-error"} onClick={() => toggleRemoteAudio(hostStream)}>Toggle Sound</button>
                    <button className={remoteVideo ? "btn btn-success" : "btn btn-error"} onClick={() => toggleRemoteVideo(hostStream)}>Toggle Video</button>
                </div>
            </div>
        </div>
    )
}