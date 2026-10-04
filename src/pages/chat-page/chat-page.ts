import { Block } from '../../lib/Block';
import { Validator } from '../../utils/Validator';
import { getFormData } from '../../utils/formData';
import { store } from '../../utils/Store';
import { ChatAPI } from '../../api/ChatAPI';
import { UserAPI } from '../../api/UserAPI';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { WSTransport } from '../../utils/WSTransport';
import { formatTime } from "../../utils/formatTime";

import template from './chat-page.hbs?raw';
interface ChatPageProps {
  chats: ChatItemData[];
  onChatClick: (chatId: number) => void;
  selectedChatId: number | null;
  isMenuOpen: boolean;
  popupType: 'add' | 'delete' | null;
  messages: ChatMessage[];
}

interface ChatItemData {
  id: number;
  title: string;
  avatarUrl: string | null;
  unreadCount: number;
  lastMessage: {
    author: string;
    text: string;
    time: string;
  } | null;
  isActive?: boolean;
}

interface ChatMessage {
  id: number;
  user_id: number;
  time: string;
  content: string;
  type: string;
  isMine?: boolean;
  displayTime?: string;
}

export class ChatPage extends Block<ChatPageProps> {
  protected template = template;

  private chatAPI = new ChatAPI();

  private userAPI = new UserAPI();

  private selectedChatId: number | null = null;

  private isMenuOpen = false;

  private sockets = new Map<number, WSTransport>();

  private messagesByChat = new Map<number, ChatMessage[]>();

  private formatMessageTime(time: string | number): string {
    const date = new Date(time);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private connectToChat(chatId: number) {
    if (this.sockets.has(chatId)) {
      return;
    }

    const user = store.getState().user as { id: number } | null;

    if (!user) {
      console.error('Пользователь не найден');
      return;
    }

    this.chatAPI.getChatToken(chatId)
      .then(({ token }) => {
        const url =
          `wss://ya-praktikum.tech/ws/chats/${user.id}/${chatId}/${token}`;

        const socket = new WSTransport(url);

        this.sockets.set(chatId, socket);

        return socket.connect().then(() => socket);
      })
      .then((socket) => {

        socket.onMessage((data) => {
          const normalizeMessage = (message: ChatMessage): ChatMessage => ({
            ...message,
            isMine: message.user_id === user!.id,
            displayTime: this.formatMessageTime(message.time),
          });

          if (Array.isArray(data)) {
            const messages = (data as ChatMessage[])
              .map(normalizeMessage)
              .sort(
                (a, b) =>
                  new Date(a.time).getTime() - new Date(b.time).getTime(),
              );

            this.messagesByChat.set(chatId, messages);

            if (this.props.selectedChatId === chatId) {
              this.setProps({
                messages,
              });
            }

            return;
          }

          const message = normalizeMessage(data as ChatMessage);

          const isCurrentChat = this.props.selectedChatId === chatId;

          const chats = this.props.chats.map((chat) => {
            if (chat.id !== chatId) {
              return chat;
            }

            return {
              ...chat,
              unreadCount: isCurrentChat
                ? 0
                : chat.unreadCount + 1,
              lastMessage: {
                author: message.isMine ? 'Вы' : 'Собеседник',
                text: message.content,
                time: message.displayTime ?? '',
              },
            };
          });

          const chatMessages = this.messagesByChat.get(chatId) ?? [];

          const updatedMessages = [...chatMessages, message];

          this.messagesByChat.set(chatId, updatedMessages);

          this.setProps({
            chats,
            ...(isCurrentChat
              ? {
                  messages: updatedMessages,
                }
              : {}),
          });
        });

        socket.send({
          type: 'get old',
          content: '0',
        });
      })
      .catch((error) => {
        console.error(`Ошибка WebSocket чата ${chatId}:`, error);
      });
  }

  private handleChatClick = (chatId: number) => {
    this.selectedChatId = chatId;
    this.isMenuOpen = false;

    const chats = this.props.chats.map((chat) => ({
      ...chat,
      isActive: chat.id === chatId,
      unreadCount: chat.id === chatId ? 0 : chat.unreadCount,
    }));

    this.setProps({
      chats,
      selectedChatId: chatId,
      messages: this.messagesByChat.get(chatId) ?? [],
    });

    this.connectToChat(chatId);
  };

  private addUser(login: string) {
    if (this.selectedChatId === null) {
      return;
    }

    this.userAPI.searchUsers(login)
      .then((users) => {
        if (!users.length) {
          throw new Error('Пользователь не найден');
        }

        const userId = users[0].id;

        return this.chatAPI.addUserToChat({
          users: [userId],
          chatId: this.selectedChatId!,
        });
      })
      .then(() => {
        this.setProps({
          popupType: null,
        });
      })
      .catch((error) => {
        const message = getErrorMessage(error);

        console.error('Ошибка добавления пользователя:', error);
        alert(message);
      });
  }

  private deleteUser(login: string) {
    if (this.selectedChatId === null) {
      return;
    }

    this.userAPI.searchUsers(login)
      .then((users) => {
        if (!users.length) {
          throw new Error('Пользователь не найден');
        }

        const userId = users[0].id;

        return this.chatAPI.deleteUserFromChat({
          users: [userId],
          chatId: this.selectedChatId!,
        });
      })
      .then(() => {
        this.setProps({
          popupType: null,
        });
      })
      .catch((error) => {
        const message = getErrorMessage(error);

        console.error('Ошибка удаления пользователя:', error);
        alert(message);
      });
  }

  private deleteChat() {
    if (this.selectedChatId === null) {
      return;
    }

    const chatId = this.selectedChatId;

    const socket = this.sockets.get(chatId);

    socket?.close();
    this.sockets.delete(chatId);

    this.chatAPI.deleteChat(chatId)
      .then(() => {
        return this.chatAPI.getChats();
      })
      .then((chats) => {
        const chatItems = (chats as Array<{
          id: number;
          title: string;
          avatar: string | null;
          unread_count: number;
          last_message: {
            user: {
              first_name: string;
              second_name: string;
              login: string;
            };
            time: string;
            content: string;
          } | null;
        }>).map((chat) => ({
          id: chat.id,
          title: chat.title,
          avatarUrl: chat.avatar,
          unreadCount: chat.unread_count,
          lastMessage: chat.last_message
            ? {
                author: chat.last_message.user.login,
                text: chat.last_message.content,
                time: formatTime(chat.last_message.time),
              }
            : null,
        }));

        store.set('chats', chatItems);

        this.selectedChatId = null;
        this.isMenuOpen = false;

        this.setProps({
          chats: chatItems,
          selectedChatId: null,
          isMenuOpen: false,
          popupType: null,
          messages: [],
        });
      })
      .catch((error) => {
        const message = getErrorMessage(error);

        console.error('Ошибка удаления чата:', error);
        alert(message);
      });
  }

  constructor() {
    const chats = store.getState().chats as ChatItemData[] ?? [];

    super({
      chats,
      onChatClick: () => {},
      selectedChatId: null,
      isMenuOpen: false,
      popupType: null,
      messages: [],
    });

    this.props.onChatClick = this.handleChatClick;
  }

  private initChatMenu() {
    const chatMenuButton = this.element()?.querySelector('#chatMenuButton');

    if (!(chatMenuButton instanceof HTMLButtonElement)) {
      return;
    }

    chatMenuButton.addEventListener('click', () => {
      this.isMenuOpen = !this.isMenuOpen;

      this.setProps({
        isMenuOpen: this.isMenuOpen,
      });
    });
  }

  private initUserMenu() {
    const addUserButton = this.element()?.querySelector('#addUserButton');
    const deleteUserButton = this.element()?.querySelector('#deleteUserButton');
    const deleteChatButton = this.element()?.querySelector('#deleteChatButton');

    if (addUserButton instanceof HTMLButtonElement) {
      addUserButton.addEventListener('click', () => {
        this.isMenuOpen = false;

        this.setProps({
          isMenuOpen: false,
          popupType: 'add',
        });
      });
    }

    if (deleteUserButton instanceof HTMLButtonElement) {
      deleteUserButton.addEventListener('click', () => {
        this.isMenuOpen = false;

        this.setProps({
          isMenuOpen: false,
          popupType: 'delete',
        });
      });
    }

    if (deleteChatButton instanceof HTMLButtonElement) {
      deleteChatButton.addEventListener('click', () => {
        this.isMenuOpen = false;
        this.deleteChat();
      });
    }

    const popupOverlay = this.element()?.querySelector('#popupOverlay');

    if (popupOverlay instanceof HTMLElement) {
      popupOverlay.addEventListener('click', (event) => {
        if (event.target === popupOverlay) {
          this.setProps({
            popupType: null,
          });
        }
      });
    }
  }

  protected componentDidMount() {
    this.initChatMenu();
    this.initUserMenu();

    this.props.chats.forEach((chat) => {
      this.connectToChat(chat.id);
    });

    const form = this.refs.messageForm;
    const newChatForm = this.refs.newChatForm;
    const userForm = this.refs.userForm;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const validator = new Validator(form);
    validator.enable();

    const messageInput = form.querySelector('input[name="message"]');

    if (messageInput instanceof HTMLInputElement) {
      messageInput.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          form.requestSubmit();
        }
      });
    }

    form.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();

      if (!validator.validateForm()) {
        return;
      }

      const data = getFormData(form);

      const socket = this.sockets.get(this.props.selectedChatId ?? -1);

      socket?.send({
        type: 'message',
        content: String(data.message),
      });
    });

    if (!(newChatForm instanceof HTMLFormElement)) {
      return;
    }

    newChatForm.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();

      const data = getFormData(newChatForm);
      const title = String(data.title).trim();

      if (!title) {
        return;
      }

      this.chatAPI.createChat({ title })
        .then(() => {
          return this.chatAPI.getChats();
        })
        .then((chats) => {
          const chatItems = (chats as Array<{
            id: number;
            title: string;
            avatar: string | null;
            unread_count: number;
            last_message: {
              user: {
                first_name: string;
                second_name: string;
                login: string;
              };
              time: string;
              content: string;
            } | null;
          }>).map((chat) => ({
            id: chat.id,
            title: chat.title,
            avatarUrl: chat.avatar,
            unreadCount: chat.unread_count,
            lastMessage: chat.last_message
              ? {
                  author: chat.last_message.user.login,
                  text: chat.last_message.content,
                  time: formatTime(chat.last_message.time),
                }
              : null,
          }));

          store.set('chats', chatItems);

          this.setProps({
            chats: chatItems,
          });
        })
        .catch((error) => {
          const message = getErrorMessage(error);

          console.error('Ошибка создания чата:', error);
          alert(message);
        });
    });

    if (userForm instanceof HTMLFormElement) {
      userForm.addEventListener('submit', (event: SubmitEvent) => {
        event.preventDefault();

        const data = getFormData(userForm);
        const login = String(data.login).trim();

        if (!login) {
          return;
        }

        if (this.props.popupType === 'add') {
          this.addUser(login);
        }

        if (this.props.popupType === 'delete') {
          this.deleteUser(login);
        }
      });
    }
  }

  protected componentWillUnmount() {}

}
