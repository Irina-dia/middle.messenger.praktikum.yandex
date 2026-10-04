import { Block } from '../../lib/Block';
import template from './button.hbs?raw';
import type { ButtonProps } from './types';

export class Button extends Block <ButtonProps> {
    static componentName = 'Button';
    protected template = template;
};
