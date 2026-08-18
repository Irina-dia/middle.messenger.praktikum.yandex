import { HTTPError } from './HTTPTransport';

export function getErrorMessage(error: unknown): string {
  if (error instanceof HTTPError) {
    if (
      error.response &&
      typeof error.response === 'object' &&
      'reason' in error.response
    ) {
      return String(error.response.reason);
    }

    switch (error.status) {
      case 400:
        return 'Некорректные данные';
      case 401:
        return 'Неверный логин или пароль';
      case 403:
        return 'Доступ запрещён';
      case 404:
        return 'Данные не найдены';
      case 409:
        return 'Пользователь уже существует';
      case 500:
        return 'Ошибка сервера';
      default:
        return 'Произошла ошибка';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка';
}
