import { useCallback, useState } from "react";

interface MessageInputProps {
    onSend: (msg: string) => void,
}

export default function MessageInput(
    { onSend }: MessageInputProps,
) {
    const [message, setMessage] = useState("");

    const sendMessage = useCallback(
        () => {
            onSend(message);
            setMessage("");
        },
        [message, onSend]
    );

    const messageEmpty = (message.trim() === "");

    return (
        <div className="flex flex-row">
            <textarea
                onChange={(e) => setMessage(e.currentTarget.value)}
                value={message}
                className="border rounded-md border-black m-1 p-1 grow text-base text-black"
            ></textarea>

            <button
                disabled={messageEmpty}
                onClick={sendMessage}
                className='shrink-0'
            >
                {messageEmpty ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                )}
            </button>
        </div>
    );
}