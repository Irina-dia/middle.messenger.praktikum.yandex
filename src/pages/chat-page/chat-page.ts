import { Block } from '../../lib/Block';
import template from './chat-page.hbs?raw';
import { chats } from '../../assets/mocks/chats';
import { Validator } from '../../utils/Validator';
import { getFormData } from '../../utils/formData';

interface ChatPageProps {
  chats: typeof chats;
}

export class ChatPage extends Block<ChatPageProps> {
  protected template = template;

  constructor() {
    super({ chats });
  }

  protected componentDidMount() {
    const form = this.refs.messageForm;

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
  }
}
