import { vi } from 'vitest';
import Handlebars from 'handlebars';
import eq from '../../assets/helpers/eq';
import { ChatItem } from './chat-item';

Handlebars.registerHelper('eq', eq);

describe('ChatItem', () => {
  it('рендерит название чата и id', () => {
    const chat = new ChatItem({
      id: 1,
      title: 'Рабочий чат',
      avatarUrl: '',
      unreadCount: 0,
      lastMessage: null,
    });

    const element = chat.element();

    expect(element?.getAttribute('data-id')).toBe('1');
    expect(element?.textContent).toContain('Рабочий чат');
  });

  it('рендерит последнее сообщение, если оно передано', () => {
    const chat = new ChatItem({
      id: 1,
      title: 'Рабочий чат',
      avatarUrl: '',
      unreadCount: 0,
      lastMessage: {
        author: 'Иван',
        text: 'Привет, как дела?',
        time: '12:30',
      },
    });

    const element = chat.element();

    expect(element?.textContent).toContain('Привет, как дела?');
  });

  it('рендерит количество непрочитанных сообщений', () => {
    const chat = new ChatItem({
      id: 1,
      title: 'Рабочий чат',
      avatarUrl: '',
      unreadCount: 3,
      lastMessage: null,
    });

    const element = chat.element();

    expect(
      element?.querySelector('.chat-item__badge')?.textContent,
    ).toBe('3');
    expect(
      element?.querySelector('.chat-item__block')?.classList.contains(
        'chat-item__block--unread',
      ),
    ).toBe(true);
  });

  it('добавляет класс active для активного чата', () => {
    const chat = new ChatItem({
      id: 1,
      title: 'Рабочий чат',
      avatarUrl: '',
      unreadCount: 0,
      lastMessage: null,
      isActive: true,
    });

    const element = chat.element();

    expect(
      element?.classList.contains('chat-item--active'),
    ).toBe(true);
  });

  it('вызывает onClick с id чата при клике', () => {
    const onClick = vi.fn();

    const chat = new ChatItem({
      id: 1,
      title: 'Рабочий чат',
      avatarUrl: '',
      unreadCount: 0,
      lastMessage: null,
      onClick,
    });

    const element = chat.element();

    element?.dispatchEvent(new Event('click'));

    expect(onClick).toHaveBeenCalledWith(1);
  });
});
