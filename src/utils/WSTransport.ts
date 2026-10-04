type WSMessage = {
  type: string;
  content?: string;
};

export class WSTransport {
  private socket: WebSocket | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        resolve();
      };

      this.socket.onerror = () => {
        reject(new Error('WebSocket connection error'));
      };

      this.socket.onclose = () => {
        console.log('WebSocket соединение закрыто');
      };
    });
  }

  send(data: WSMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    this.socket.send(JSON.stringify(data));
  }

  onMessage(callback: (data: unknown) => void): void {
    if (!this.socket) {
      throw new Error('WebSocket is not connected');
    }

    this.socket.onmessage = (event) => {
      callback(JSON.parse(event.data));
    };
  }

  close(): void {
    this.socket?.close();
    this.socket = null;
  }
}
