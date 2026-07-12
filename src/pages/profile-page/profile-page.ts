import { Block } from '../../lib/Block';
import template from './profile-page.hbs?raw';
import { Validator } from '../../utils/Validator';
import { getFormData } from '../../utils/formData';

type ProfileMode =
    | 'view'
    | 'edit'
    | 'password';

interface ProfilePageProps {
    mode: ProfileMode;

    isView: boolean;
    isPassword: boolean;
}

export class ProfilePage extends Block<ProfilePageProps> {
  protected template = template;

  private setMode(mode: ProfileMode) {
    if (this.props.mode === mode) {
        return;
    }

    this.setProps({
        mode,
        isView: mode === "view",
        isPassword: mode === "password",
    });
  }

  constructor() {
    super({
        mode: "view",
        isView: true,
        isPassword: false,
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
    console.log('Данные формы:', data);
    this.setMode("view");
    })
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

      if(!(data.new_password === data.repeat_password)) {
        console.log("Пароли не совпадают");
        return;
      }

      console.log('Данные паролей:', data);
      this.setMode("view");
    })
  }

  private initButtons() {
    const editBtn = this.element()?.querySelector('#editBtn');
    const changeBtn = this.element()?.querySelector('#changeBtn');
    editBtn?.addEventListener('click', () => {
      this.setMode("edit");
    })
    changeBtn?.addEventListener('click', () => {
      this.setMode("password");
    })
  }

  protected componentDidMount() {
    this.initButtons();
    this.initProfileForm();
    this.initPasswordForm();
  }
}
