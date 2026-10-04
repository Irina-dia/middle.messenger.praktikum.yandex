import './assets/styles/style.scss';
import Handlebars from 'handlebars';
import { Router } from './lib/Router';
import { Route } from './lib/Route';
import { AuthAPI } from './api/AuthAPI';
import { store } from './utils/Store';
import { ChatAPI, type Chat } from './api/ChatAPI';
import { formatTime } from './utils/formatTime';

import eq from './assets/helpers/eq';

/*pages */
import { AuthPage } from './pages/auth-page';
import { RegistrationPage} from './pages/registration-page';
import { Error404 } from './pages/404-error-page';
import { Error500 } from './pages/500-error-page';
import { ChatPage } from './pages/chat-page/chat-page';
import { ProfilePage } from './pages/profile-page/profile-page';

import { registerComponents } from './lib/RegisterComponents';

registerComponents();

Handlebars.registerHelper('eq', eq);

const router = new Router(
  new Route(
    '/404',
    Error404,
    {
      rootQuery: '#app',
    }
  ),
  '#app'
);

router
  .use('/', AuthPage)
  .use('/sign-up', RegistrationPage)
  .use('/messenger', ChatPage)
  .use('/settings', ProfilePage)
  .use('/500', Error500)
  .use('/404', Error404);

const authAPI = new AuthAPI();
const chatAPI = new ChatAPI();

store.subscribe(() => {
  console.log('Store изменился:', store.getState());
});

authAPI.getUser()
  .then((user) => {
    store.set('user', user);

    return chatAPI.getChats()
      .then((chats) => {
        const chatItems = (chats as Chat[]).map((chat) => ({
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
      })
      .catch((error) => {
        console.error('Ошибка загрузки чатов:', error);
        store.set('chats', []);
      });
  })
  .catch(() => {
    store.set('user', null);
  })
  .finally(() => {
    router.start();
  });
