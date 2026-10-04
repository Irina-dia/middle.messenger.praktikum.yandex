import { HTTPTransport } from "../utils/HTTPTransport";
import { API_URL } from './constants';

export interface SigninData {
  login: string;
  password: string;
}

export interface SignupData {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

export class AuthAPI {
  private transport = new HTTPTransport();

  signin(data: SigninData) {
    return this.transport.post(`${API_URL}/auth/signin`, {
      data,
    });
  }

  signup(data: SignupData) {
    return this.transport.post(`${API_URL}/auth/signup`, {
      data,
    });
  }

  getUser() {
    return this.transport.get(`${API_URL}/auth/user`);
  }

  logout() {
    return this.transport.post(`${API_URL}/auth/logout`);
  }
}
