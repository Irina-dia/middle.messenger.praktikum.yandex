import { Block } from '../../lib/Block';
import template from './profile-page.hbs?raw';
import { Validator } from '../../utils/Validator';
import { getFormData } from '../../utils/formData';
import { Router } from '../../lib/Router';
import { AuthAPI } from '../../api/AuthAPI';
import { store } from '../../utils/Store';
import { UserAPI } from '../../api/UserAPI';
import type { ProfileData, User } from '../../api/UserAPI';
import { getErrorMessage } from '../../utils/getErrorMessage';

type ProfileMode =
  | 'view'
  | 'edit'
  | 'password';

interface ProfilePageProps {
  mode: ProfileMode;
  isView: boolean;
  isPassword: boolean;
  user: User | null;
}

export class ProfilePage extends Block<ProfilePageProps> {
  protected template = template;

  private authAPI = new AuthAPI();

  private userAPI = new UserAPI();

  private setMode(mode: ProfileMode) {
    if (this.props.mode === mode) {
      return;
    }

    this.setProps({
      mode,
      isView: mode === 'view',
      isPassword: mode === 'password',
    });
  }

  private initProfileForm() {
    const form = this.refs.profileForm;

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

      const profileData: ProfileData = {
        email: String(data.email),
        login: String(data.login),
        first_name: String(data.first_name),
        second_name: String(data.second_name),
        display_name: String(data.display_name),
        phone: String(data.phone),
      };

      this.userAPI.updateProfile(profileData)
        .then((user) => {
          store.set('user', user);

          this.setProps({
            user,
          });

          console.log('Профиль обновлён:', user);

          this.setMode('view');
        })
        .catch((error) => {
          const message = getErrorMessage(error);

          console.error('Ошибка обновления профиля:', error);
          alert(message);
        });
    });
  }

  private initPasswordForm() {
    const form = this.refs.profileFormPassword;

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

      const repeatPasswordInput = form.querySelector(
        '[name="repeat_password"]'
      );

      const repeatPasswordError = repeatPasswordInput
        ?.closest('.profile__row')
        ?.querySelector('.profile-input__error');

      if (repeatPasswordError instanceof HTMLElement) {
        repeatPasswordError.textContent = '';
        repeatPasswordError.classList.remove('error_show');
      }

      if (data.new_password !== data.repeat_password) {
        if (repeatPasswordError instanceof HTMLElement) {
          repeatPasswordError.textContent = 'Пароли не совпадают';
          repeatPasswordError.classList.add('error_show');
        }

        return;
      }

      const passwordData = {
        oldPassword: String(data.old_password),
        newPassword: String(data.new_password),
      };

      this.userAPI.updatePassword(passwordData)
        .then(() => {
          console.log('Пароль успешно изменён');

          this.setMode('view');
        })
        .catch((error) => {
          const message = getErrorMessage(error);

          console.error('Ошибка изменения пароля:', error);
          alert(message);
        });
    });
  }

  private initButtons() {
    const editBtn = this.element()?.querySelector('#editBtn');
    const changeBtn = this.element()?.querySelector('#changeBtn');
    const logoutBtn = this.element()?.querySelector('#logoutBtn');

    editBtn?.addEventListener('click', () => {
      this.setMode('edit');
    });

    changeBtn?.addEventListener('click', () => {
      this.setMode('password');
    });

    logoutBtn?.addEventListener('click', () => {
      this.authAPI.logout()
        .then(() => {
          store.set('user', null);

          console.log('Выход выполнен');
          console.log('Store:', store.getState());

          Router.getInstance().go('/');
        })
        .catch((error) => {
          const message = getErrorMessage(error);

          console.error('Ошибка выхода:', error);
          alert(message);
        });
    });
  }

  private initAvatar() {
    const wrapper = this.element()?.querySelector('#avatarWrapper');
    const input = this.refs.avatarInput;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    wrapper?.addEventListener('click', () => {
      if (this.props.mode !== 'edit') {
        return;
      }

      input.click();
    });

    input.addEventListener('change', () => {
      const file = input.files?.[0];

      if (!file) {
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      this.userAPI.updateAvatar(formData)
        .then((user) => {
          store.set('user', user);

          this.setProps({
            user,
          });

          console.log('Аватар обновлён:', user);
        })
        .catch((error) => {
          const message = getErrorMessage(error);

          console.error('Ошибка обновления аватара:', error);
          alert(message);
        });
    });
  }

  constructor() {
    const user = store.getState().user as User | null;

    super({
      mode: 'view',
      isView: true,
      isPassword: false,
      user,
    });
  }

  protected componentDidMount() {
    this.initButtons();
    this.initProfileForm();
    this.initPasswordForm();
    this.initAvatar();
  }
}
