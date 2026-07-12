import { Block } from '../../lib/Block';
import template from './registration-page.hbs?raw';
import { Validator } from '../../utils/Validator';
import { getFormData } from '../../utils/formData';

export class RegistrationPage extends Block {
  protected template = template;

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
      console.log('Данные формы:', data);
    });
  }
}
