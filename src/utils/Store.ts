type State = Record<string, unknown>;

export class Store {
  private state: State;
  
  private listeners: Array<() => void> = [];

  constructor(initialState: State = {}) {
    this.state = initialState;
  }

  getState() {
    return this.state;
  }

  set(key: string, value: unknown) {
    this.state[key] = value;

    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(
        (item) => item !== listener
      );
    };
  }
}

export const store = new Store();
