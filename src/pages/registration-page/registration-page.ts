import { Block } from '../../lib/Block';
import { Router } from '../../lib/Router';
import { Validator } from '../../utils/Validator';
import { getFormData } from '../../utils/formData';
import { AuthAPI } from '../../api/AuthAPI';
import { store } from '../../utils/Store';
import { getErrorMessage } from '../../utils/getErrorMessage';
import template from './registration-page.hbs?raw';

export class RegistrationPage extends Block {
  protected template = template;

  private authAPI = new AuthAPI();

  protected componentDidMount() {
    const form = this.refs.registrationForm;

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

      console.log('Данные регистрации:', data);

      this.authAPI.signup({
        email: String(data.email),
        login: String(data.login),
        first_name: String(data.first_name),
        second_name: String(data.second_name),
        phone: String(data.phone),
        password: String(data.password),
      })
        .then(() => {
          return this.authAPI.getUser();
        })
        .then((user) => {
          store.set('user', user);

          console.log('Пользователь зарегистрирован:', user);
          console.log('Store:', store.getState());

          Router.getInstance().go('/messenger');
        })
        .catch((error) => {
          const message = getErrorMessage(error);

          console.error('Ошибка регистрации:', error);
          alert(message);
        });
    });
  }
}
