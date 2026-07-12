import { Block } from "../../lib/Block";
import type { ChatItemProps } from "./types";
import template from "./chat-item.hbs?raw";

export class ChatItem extends Block<ChatItemProps> {
    static componentName = 'ChatItem';
    protected template = template;
}
