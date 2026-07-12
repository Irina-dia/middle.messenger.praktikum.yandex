import { Block } from '../../lib/Block';
import template from './500-error-page.hbs?raw';

export class Error500 extends Block {
  protected template = template;
}
