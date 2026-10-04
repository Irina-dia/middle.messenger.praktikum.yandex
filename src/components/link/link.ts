import { Block } from '../../lib/Block';
import type { LinkProps } from './types';
import template from './link.hbs?raw';

export class Link extends Block <LinkProps> {
    static componentName = 'Link';
    protected template = template;
}
