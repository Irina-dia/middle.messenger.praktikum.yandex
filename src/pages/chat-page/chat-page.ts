import { Block } from '../../lib/Block';
import { Validator } from '../../utils/Validator';
import { getFormData } from '../../utils/formData';
import { store } from '../../utils/Store';
import { ChatAPI } from '../../api/ChatAPI';
import { UserAPI } from '../../api/UserAPI';
import { getErrorMessage } from '../../utils/getErrorMessage';
import template from './chat-page.hbs?raw';
interface ChatPageProps {
  chats: ChatItemData[];
  onChatClick: (chatId: number) => void;
  selectedChatId: number | null;
  isMenuOpen: boolean;
  popupType: 'add' | 'delete' | null;
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

export class ChatPage extends Block<ChatPageProps> {
  protected template = template;

  private chatAPI = new ChatAPI();

  private userAPI = new UserAPI();

  private selectedChatId: number | null = null;

  private isMenuOpen = false;

  private handleChatClick = (chatId: number) => {
    this.selectedChatId = chatId;
    this.isMenuOpen = false;

    const chats = this.props.chats.map((chat) => ({
      ...chat,
      isActive: chat.id === chatId,
    }));

    this.setProps({
      chats,
      selectedChatId: chatId,
    });

    console.log('Выбран чат в ChatPage:', chatId);
  };

  private addUser(login: string) {
    if (this.selectedChatId === null) {
      console.log('Сначала выберите чат');
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
        console.log(
          `Пользователь ${login} добавлен в чат ${this.selectedChatId}`,
        );

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
      console.log('Сначала выберите чат');
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
        console.log(
          `Пользователь ${login} удалён из чата ${this.selectedChatId}`,
        );

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

  constructor() {
    const chats = store.getState().chats as ChatItemData[] ?? [];

    super({
      chats,
      onChatClick: () => {},
      selectedChatId: null,
      isMenuOpen: false,
      popupType: null,
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

    const form = this.refs.messageForm;
    const newChatForm = this.refs.newChatForm;
    const userForm = this.refs.userForm;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const validator = new Validator(form);
    validator.enable();

    form.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();

      if (!validator.validateForm()) {
        return;
      }

      const data = getFormData(form);
      console.log('Сообщение:', data);
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
          console.log('Чат создан');

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
                  time: chat.last_message.time,
                }
              : null,
          }));

          store.set('chats', chatItems);

          this.setProps({
            chats: chatItems,
          });
          console.log('Список чатов обновлён:', chatItems);
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
}
