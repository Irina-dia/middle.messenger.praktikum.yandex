import { Block } from '../../lib/Block';
import template from './input-profile.hbs?raw';
import type { InputProfileProps } from './types';

export class InputProfile extends Block<InputProfileProps> {
    static componentName = 'InputProfile';
    protected template = template;
}
