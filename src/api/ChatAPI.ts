import { HTTPTransport } from '../utils/HTTPTransport';
import { API_URL } from './constants';

export interface CreateChatData {
  title: string;
}

export interface ChatUsersData {
  users: number[];
  chatId: number;
}

export interface Chat {
  id: number;
  title: string;
  avatar: string | null;
  created_by: number;
  unread_count: number;
  last_message: {
    user: {
      first_name: string;
      second_name: string;
      avatar: string | null;
      email: string;
      login: string;
    };
    time: string;
    content: string;
  } | null;
}

export class ChatAPI {
  private transport = new HTTPTransport();

  getChats(): Promise<Chat[]> {
    return this.transport.get(`${API_URL}/chats`) as Promise<Chat[]>;
  }

  createChat(data: CreateChatData) {
    return this.transport.post(`${API_URL}/chats`, {
      data,
    });
  }

  addUserToChat(data: ChatUsersData) {
    return this.transport.put(`${API_URL}/chats/users`, {
      data,
    });
  }

  deleteUserFromChat(data: ChatUsersData) {
    return this.transport.delete(`${API_URL}/chats/users`, {
      data,
    });
  }
}
