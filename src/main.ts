import './assets/styles/style.scss';
import { Block } from './lib/Block';
import Handlebars from 'handlebars';

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

const routes = {
  '#profile': ProfilePage,
  '': AuthPage,
  '#auth': AuthPage,
  '#reg': RegistrationPage,
  '#chat': ChatPage,
  '#404': Error404,
  '#500': Error500,
};

function render(page: Block) {
  const app = document.querySelector('#app');

  if (!app) return;

  const pageElement = page.element();

  if (!pageElement) {
    return;
  }

  app.replaceChildren(pageElement);
}

function router() {
    const Page = routes[window.location.hash as keyof typeof routes] ?? Error404;
    render(new Page());
  }

window.addEventListener('load', router);
window.addEventListener('hashchange', router);
