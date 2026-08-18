const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

type Data = object;
type Method = typeof METHODS[keyof typeof METHODS];

export interface RequestOptions {
  data?: Data | FormData;
  method?: Method;
}

export class HTTPError extends Error {
  public status: number;
  public response: unknown;

  constructor(status: number, response: unknown) {
    super(`HTTP error: ${status}`);

    this.name = 'HTTPError';
    this.status = status;
    this.response = response;
  }
}

function queryStringify(data: object): string {
  return Object.entries(data)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
}

export class HTTPTransport {
  get(url: string, options: RequestOptions = {}) {
    return this.request(url, {
      ...options,
      method: METHODS.GET,
    });
  }

  post(url: string, options: RequestOptions = {}) {
    return this.request(url, {
      ...options,
      method: METHODS.POST,
    });
  }

  put(url: string, options: RequestOptions = {}) {
    return this.request(url, {
      ...options,
      method: METHODS.PUT,
    });
  }

  delete(url: string, options: RequestOptions = {}) {
    return this.request(url, {
      ...options,
      method: METHODS.DELETE,
    });
  }

  private request(url: string, options: RequestOptions = {}) {
    return new Promise<unknown>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (!options.method) {
        reject(new Error('Method is required'));
        return;
      }

      let requestUrl = url;

      if (options.method === METHODS.GET && options.data) {
        if (options.data instanceof FormData) {
          reject(new Error('FormData is not supported for GET requests'));
          return;
        }

        requestUrl = `${url}?${queryStringify(options.data)}`;
      }

      xhr.open(options.method, requestUrl);

      xhr.withCredentials = true;
      xhr.responseType = 'json';

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
          return;
        }

        reject(new HTTPError(xhr.status, xhr.response));
      };

      xhr.onerror = () => {
        reject(new Error('Network error'));
      };

      if (options.method === METHODS.GET || !options.data) {
        xhr.send();
        return;
      }

      if (options.data instanceof FormData) {
        xhr.send(options.data);
        return;
      }

      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(options.data));
    });
  }
}
