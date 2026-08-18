import { Block } from '../../lib/Block';
import { Router } from '../../lib/Router';
import { Validator } from '../../utils/Validator';
import { getFormData } from '../../utils/formData';
import { AuthAPI } from '../../api/AuthAPI';
import { store } from '../../utils/Store';
import { getErrorMessage } from '../../utils/getErrorMessage';
import template from './auth-page.hbs?raw';

export class AuthPage extends Block {
  protected template = template;

  private authAPI = new AuthAPI();

  protected componentDidMount() {
    const form = this.refs.authForm;

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

      this.authAPI.signin({
        login: String(data.login),
        password: String(data.password),
      })
        .then(() => {
          return this.authAPI.getUser();
        })
        .then((user) => {
          store.set('user', user);

          console.log('Пользователь записан в Store:', user);

          Router.getInstance().go('/messenger');
        })
        .catch((error) => {
          const message = getErrorMessage(error);

          console.error('Ошибка авторизации:', error);
          alert(message);
        });
    });
  }
}
