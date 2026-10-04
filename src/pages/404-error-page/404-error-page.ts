import { Block } from '../../lib/Block';
import template from './404-error-page.hbs?raw';

export class Error404 extends Block {
  protected template = template;
}
