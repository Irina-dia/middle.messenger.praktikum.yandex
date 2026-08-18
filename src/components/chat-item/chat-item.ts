import { Block } from "../../lib/Block";
import type { ChatItemProps } from "./types";
import template from "./chat-item.hbs?raw";

export class ChatItem extends Block<ChatItemProps> {
  static componentName = 'ChatItem';

  protected template = template;

  protected componentDidMount() {
    const element = this.element();

    if (!element) {
      return;
    }

    element.addEventListener('click', () => {
      this.props.onClick?.(this.props.id);
    });
  }
}
