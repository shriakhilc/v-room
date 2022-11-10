import { ChatMessage } from "../utils/meetings";

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