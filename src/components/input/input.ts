import { Block } from '../../lib/Block';
import template from './input.hbs?raw';
import type { InputProps } from './types';

export class Input extends Block <InputProps> {
    static componentName = 'Input';
    protected template = template;
}
