export enum DataEvent {
    CHAT_MESSAGE,
}

export interface DataPayload {
    event: DataEvent,
    data: ChatMessage,
}

export interface ChatMessage {
    senderName: string,
    timestamp: number, // result of Date.now()
    message: string,
}

export default function MessageDisplay(props: { message: ChatMessage }) {
    return (
        <div className="py-2">
            <div className="flex flex-row justify-between">
                <span className="text-base">{props.message.senderName}</span>
                <span className="text-sm text-gray-500">{new Date(props.message.timestamp).toLocaleString()}</span>
            </div>

            <span className="text-base whitespace-normal break-all">{props.message.message}</span>
        </div>
    );
}