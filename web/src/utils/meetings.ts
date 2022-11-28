import { DataConnection, MediaConnection } from "peerjs";

export enum DataEvent {
    CHAT_MESSAGE,
    ID_MESSAGE,
    PARTICIPANT_LIST_MESSAGE,
}

export interface DataPayload {
    event: DataEvent,
    data: ChatMessage | IdMessage | ParticipantListMessage,
}

export interface ChatMessage {
    senderName: string,
    timestamp: number, // result of Date.now()
    message: string,
}

export interface IdMessage {
    peerId: string,
    name: string,
}

export interface ParticipantListMessage {
    peers: IdMessage[]
}

export interface ParticipantInfo {
    name: string,
    dataConn: DataConnection,
    mediaConn?: MediaConnection,
}

/**
 * Abstract Class
 *
 * @class DataMessage
 */
// export class DataMessage {

//     constructor() {
//         if (this.constructor == DataMessage) {
//             throw new Error("Abstract classes can't be instantiated.");
//         }
//     }

// }

// export class ChatMessage extends DataMessage {
//     name: string;
//     timestamp: number;
//     message: string;

//     constructor(name: string, timestamp: number, message: string) {
//         super();
//         this.name = name;
//         this.timestamp = timestamp;
//         this.message = message;
//     }

// }

// export class NewJoinMessage extends DataMessage {
//     peerId: string;
//     name: string;

//     constructor(peerId: string, name: string) {
//         super();
//         this.peerId = peerId;
//         this.name = name;
//     }
// }