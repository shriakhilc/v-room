import { DataConnection, MediaConnection } from "peerjs";

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

export interface ParticipantInfo {
    name: string,
    dataConn: DataConnection,
    mediaConn?: MediaConnection,
}