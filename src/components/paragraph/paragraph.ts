import { Block } from '../../lib/Block';
import template from './paragraph.hbs?raw';
import type { ParagraphProps } from './types';

export class Paragraph extends Block <ParagraphProps> {
    static componentName = 'Paragraph';
    protected template = template;
};
