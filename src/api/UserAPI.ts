import { HTTPTransport } from '../utils/HTTPTransport';
import { API_URL } from './constants';

export interface User {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export interface ProfileData {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
}

export interface PasswordData {
  oldPassword: string;
  newPassword: string;
}

export class UserAPI {
  private transport = new HTTPTransport();

  updateProfile(data: ProfileData): Promise<User> {
    return this.transport.put(`${API_URL}/user/profile`, {
      data,
    }) as Promise<User>;
  }

  updatePassword(data: PasswordData) {
    return this.transport.put(`${API_URL}/user/password`, {
      data,
    });
  }

  updateAvatar(data: FormData): Promise<User> {
    return this.transport.put(`${API_URL}/user/profile/avatar`, {
      data,
    }) as Promise<User>;
  }

  searchUsers(login: string): Promise<User[]> {
    return this.transport.post(`${API_URL}/user/search`, {
      data: {
        login,
      },
    }) as Promise<User[]>;
  }
}
