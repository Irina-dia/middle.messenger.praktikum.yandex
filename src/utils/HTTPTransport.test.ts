import { vi } from 'vitest';
import { HTTPError, HTTPTransport } from './HTTPTransport';

class MockXMLHttpRequest {
  static instance: MockXMLHttpRequest;

  status = 200;
  response: unknown = { id: 1 };

  open = vi.fn();
  send = vi.fn();
  setRequestHeader = vi.fn();

  withCredentials = false;
  responseType = '';

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    MockXMLHttpRequest.instance = this;
  }
}

describe('HTTPTransport', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('GET отправляет запрос и возвращает response', async () => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

    const transport = new HTTPTransport();

    const promise = transport.get('/users');

    const xhr = MockXMLHttpRequest.instance;

    xhr.onload?.();

    await expect(promise).resolves.toEqual({ id: 1 });

    expect(xhr.open).toHaveBeenCalledWith('GET', '/users');
    expect(xhr.send).toHaveBeenCalled();

    expect(xhr.withCredentials).toBe(true);
    expect(xhr.responseType).toBe('json');
  });

  it('GET добавляет query-параметры в URL', async () => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

    const transport = new HTTPTransport();

    const promise = transport.get('/users', {
      data: {
        page: 2,
        limit: 10,
      },
    });

    const xhr = MockXMLHttpRequest.instance;

    xhr.onload?.();

    await expect(promise).resolves.toEqual({ id: 1 });

    expect(xhr.open).toHaveBeenCalledWith(
      'GET',
      '/users?page=2&limit=10',
    );
  });

  it('POST отправляет данные в формате JSON', async () => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

    const transport = new HTTPTransport();

    const promise = transport.post('/users', {
      data: {
        name: 'Frodo',
      },
    });

    const xhr = MockXMLHttpRequest.instance;

    xhr.onload?.();

    await expect(promise).resolves.toEqual({ id: 1 });

    expect(xhr.open).toHaveBeenCalledWith('POST', '/users');
    expect(xhr.setRequestHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json',
    );
    expect(xhr.send).toHaveBeenCalledWith(
      JSON.stringify({ name: 'Frodo' }),
    );
  });

  it('отклоняет Promise при HTTP-ошибке', async () => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

    const transport = new HTTPTransport();

    const promise = transport.get('/users');

    const xhr = MockXMLHttpRequest.instance;

    xhr.status = 500;
    xhr.response = { reason: 'Internal Server Error' };
    xhr.onload?.();

    await expect(promise).rejects.toMatchObject({
      status: 500,
      response: { reason: 'Internal Server Error' },
    });
  });

  it('отклоняет Promise при сетевой ошибке', async () => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

    const transport = new HTTPTransport();

    const promise = transport.get('/users');

    const xhr = MockXMLHttpRequest.instance;

    xhr.onerror?.();

    await expect(promise).rejects.toThrow('Network error');
  });

  it('POST отправляет FormData без преобразования в JSON', async () => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

    const transport = new HTTPTransport();

    const formData = new FormData();
    formData.append('name', 'Frodo');

    const promise = transport.post('/users', {
      data: formData,
    });

    const xhr = MockXMLHttpRequest.instance;

    xhr.onload?.();

    await expect(promise).resolves.toEqual({ id: 1 });

    expect(xhr.open).toHaveBeenCalledWith('POST', '/users');
    expect(xhr.send).toHaveBeenCalledWith(formData);
    expect(xhr.setRequestHeader).not.toHaveBeenCalled();
  });

  it('отклоняет GET с FormData', async () => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

    const transport = new HTTPTransport();

    const formData = new FormData();
    formData.append('name', 'Frodo');

    const promise = transport.get('/users', {
      data: formData,
    });

    await expect(promise).rejects.toThrow(
      'FormData is not supported for GET requests',
    );

    expect(MockXMLHttpRequest.instance.open).not.toHaveBeenCalled();
  });

  it('PUT отправляет запрос с методом PUT', async () => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

    const transport = new HTTPTransport();

    const promise = transport.put('/users/1', {
      data: {
        name: 'Frodo',
      },
    });

    const xhr = MockXMLHttpRequest.instance;

    xhr.onload?.();

    await expect(promise).resolves.toEqual({ id: 1 });

    expect(xhr.open).toHaveBeenCalledWith('PUT', '/users/1');

    expect(xhr.setRequestHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json',
    );

    expect(xhr.send).toHaveBeenCalledWith(
      JSON.stringify({ name: 'Frodo' }),
    );
  });

  it('DELETE отправляет запрос без данных', async () => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

    const transport = new HTTPTransport();

    const promise = transport.delete('/users/1');

    const xhr = MockXMLHttpRequest.instance;

    xhr.onload?.();

    await expect(promise).resolves.toEqual({ id: 1 });

    expect(xhr.open).toHaveBeenCalledWith('DELETE', '/users/1');
    expect(xhr.send).toHaveBeenCalledWith();
    expect(xhr.setRequestHeader).not.toHaveBeenCalled();
  });

  it('GET кодирует query-параметры', async () => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

    const transport = new HTTPTransport();

    const promise = transport.get('/users', {
      data: {
        name: 'Frodo Baggins',
        city: 'Москва',
      },
    });

    const xhr = MockXMLHttpRequest.instance;

    xhr.onload?.();

    await expect(promise).resolves.toEqual({ id: 1 });

    expect(xhr.open).toHaveBeenCalledWith(
      'GET',
      `/users?name=${encodeURIComponent('Frodo Baggins')}&city=${encodeURIComponent('Москва')}`,
    );
  });
});


describe('HTTPError', () => {
  it('создаёт ошибку с status и response', () => {
    const response = {
      reason: 'Internal Server Error',
    };

    const error = new HTTPError(500, response);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.name).toBe('HTTPError');
    expect(error.message).toBe('HTTP error: 500');
    expect(error.status).toBe(500);
    expect(error.response).toEqual(response);
  });
});
