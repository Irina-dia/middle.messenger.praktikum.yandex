import { Block } from '../../lib/Block';
import { Validator } from '../../utils/Validator';
import { getFormData } from '../../utils/formData';
import template from './auth-page.hbs?raw';

export class AuthPage extends Block {
  protected template = template;

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
       console.log('Данные формы:', data);
     });
  }
}
