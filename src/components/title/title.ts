import { Block } from '../../lib/Block';
import template from './title.hbs?raw';
import type { TitleProps } from './types';

export class Title extends Block <TitleProps> {
    static componentName = 'Title';
    protected template = template;
};
