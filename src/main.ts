import './assets/styles/style.scss'
import Handlebars from 'handlebars';

import authPage from './assets/pages/auth-page/auth-page.hbs?raw';
import regPage from './assets/pages/registration-page/registration-page.hbs?raw';
import notFoundPage from './assets/pages/404-error-page/404-error-page.hbs?raw';
import internalServerErrorPage from './assets/pages/500-error-page/500-error-page.hbs?raw';
import chatPage from './assets/pages/chat-page/chat-page.hbs?raw';
import profilePage from './assets/pages/profile-page/profile-page.hbs?raw';
import button from './assets/components/button/button.hbs?raw';
import link from './assets/components/link/link.hbs?raw';
import input from './assets/components/input/input.hbs?raw';
import title from './assets/components/title/title.hbs?raw';
import paragraph from './assets/components/paragraph/paragraph.hbs?raw';
import chatItem from './assets/components/chat-item/chat-item.hbs?raw';
import inputProfile from './assets/components/input-profile/input-profile.hbs?raw';
import { chats } from './assets/mocks/chats.js';
import lt from './assets/helpers/lt.js';
import eq from './assets/helpers/eq.js';

Handlebars.registerPartial('button', button);
Handlebars.registerPartial('link', link);
Handlebars.registerPartial('input', input);
Handlebars.registerPartial('input-profile', inputProfile);
Handlebars.registerPartial('title', title);
Handlebars.registerPartial('paragraph', paragraph);
Handlebars.registerPartial("chat-item", chatItem);

Handlebars.registerHelper("lt", lt);
Handlebars.registerHelper("eq", eq);

function render(templateName: string, pageData = {}) {
  const app = document.querySelector('#app');

  if (!app) return;

  const template = Handlebars.compile(templateName);
  app.innerHTML = template(pageData);
}

function router() {
  switch(window.location.hash) {
    case '':
    case '#auth':
      render(authPage);
      break;
    case '#reg':
      render(regPage);
      break;
    case '#chat':
       render(chatPage, { chats });
      break;
    case '#profile':
       render(profilePage);
      break;
    case '#404':
      render(notFoundPage);
      break;
    case '#500':
      render(internalServerErrorPage);
      break;
    default:      
      render(notFoundPage);
  }
}

window.addEventListener('load', router);
window.addEventListener('hashchange', router);
