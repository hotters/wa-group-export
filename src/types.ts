export type WsMessageType =
  | 'qr'
  | 'init'
  | 'group'
  | 'chats'
  | 'contacts'
  | 'history'
  | 'error'
  | 'reset';

export interface WsMessage {
  type: WsMessageType;
  payload: any;
}
