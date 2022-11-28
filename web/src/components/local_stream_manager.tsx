import { useCallback, useEffect, useRef, useState } from 'react';

interface LocalStreamManagerProps {
    setLocalStream: (arg0: MediaStream) => void,
    localStream: MediaStream | null,
    host?: boolean,
    classroomid?: string,
    peerid?: string,
}

export default function LocalStreamManager(props: LocalStreamManagerProps) {
    const [playing, setPlaying] = useState(false);

    const [localAudio, setLocalAudio] = useState(false);
    const [localVideo, setLocalVideo] = useState(true);

    const localStreamView = useRef<HTMLVideoElement | null>(null);

    const toggleLocalAudio = useCallback(
        (stream: MediaStream | null, enabled?: boolean) => {
            let current = localAudio
            if (enabled !== undefined) {
                setLocalAudio(enabled)
            } else {
                current = !current
            }
            setLocalAudio(current)
            if (stream !== null) {
                stream.getAudioTracks().forEach((track) => track.enabled = current)
            }
        },
        [localAudio]
    );

    const toggleLocalVideo = useCallback(
        (stream: MediaStream | null, enabled?: boolean) => {
            let current = localVideo
            if (enabled !== undefined) {
                current = enabled
            } else {
                current = !current
            }
            setLocalVideo(current)
            if (stream !== null) {
                stream.getVideoTracks().forEach((track) => track.enabled = current)
            }
        },
        [localVideo]
    );

    useEffect(
        () => {
            if (!playing) {
                if (navigator?.mediaDevices !== undefined) { //TODO: handle this, may occur when not inside secure contexts
                    navigator.mediaDevices
                        .getUserMedia({ //TODO: display a notice/reason for rejection
                            // this indicates that stream must support both
                            video: true,
                            audio: true,
                        })
                        .then((newStream) => {
                            if (localStreamView?.current !== null) {
                                console.log('setting localstream');
                                props.setLocalStream(newStream);
                                toggleLocalAudio(newStream, false);
                                toggleLocalVideo(newStream, true);
                                localStreamView.current.srcObject = newStream;
                            }
                        });
                    setPlaying(true);
                }
            }
        },
        [props, playing, localStreamView, toggleLocalAudio, toggleLocalVideo]
    );

    const stopStream = () => {
        if (props.localStream !== null) {
            props.localStream.getTracks().forEach((track) => track.stop())
            setPlaying(false);
        }
        //TODO: if host, update classroom to remove peerid as a meeting
    };

    return (
        <div className="">
            {/* TODO: Better way than fixed width? */}
            <video className="card w-[480px]" ref={localStreamView} autoPlay playsInline muted></video>
            <div className="btn-group btn-group-horizontal">
                {/* <button className={playing ? "btn btn-success" : "btn btn-error"}
                    onClick={stopStream}>
                    {playing ? (props.host ? "end meeting" : "leave meeting") : (props.host ? "start meeting" : "join meeting")}
                </button> */}
                <button className={localAudio ? "btn btn-success" : "btn btn-error"} onClick={() => toggleLocalAudio(props.localStream)}>
                    {localAudio ?
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 384 512" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="30" d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z" /></svg> :
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 640 512" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="30" d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L472.1 344.7c15.2-26 23.9-56.3 23.9-88.7V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 21.2-5.1 41.1-14.2 58.7L416 300.8V96c0-53-43-96-96-96s-96 43-96 96v54.3L38.8 5.1zM344 430.4c20.4-2.8 39.7-9.1 57.3-18.2l-43.1-33.9C346.1 382 333.3 384 320 384c-70.7 0-128-57.3-128-128v-8.7L144.7 210c-.5 1.9-.7 3.9-.7 6v40c0 89.1 66.2 162.7 152 174.4V464H248c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H344V430.4z" /></svg>}
                </button>
                <button className={localVideo ? "btn btn-success" : "btn btn-error"} onClick={() => toggleLocalVideo(props.localStream)}>
                    {localVideo ?
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 576 512" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="30" d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z" /></svg> :
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 640 512" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="30" d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7l-86.4-67.7 13.8 9.2c9.8 6.5 22.4 7.2 32.9 1.6s16.9-16.4 16.9-28.2V128c0-11.8-6.5-22.6-16.9-28.2s-23-5-32.9 1.6l-96 64L448 174.9V192 320v5.8l-32-25.1V128c0-35.3-28.7-64-64-64H113.9L38.8 5.1zM32 128V384c0 35.3 28.7 64 64 64H352c23.4 0 43.9-12.6 55-31.3L32.3 121.5c-.2 2.1-.3 4.3-.3 6.5z" /></svg>}
                </button>
            </div>
        </div>
    )
}