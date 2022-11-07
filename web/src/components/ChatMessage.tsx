
interface ChatMessage {
    sender_name: string,
    timestamp: number, // result of Date.now()
    message: string,
}

export default function ChatMessage(props: ChatMessage) {
    return (
        <>
        </>
    );
}