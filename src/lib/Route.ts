import { Block } from './Block';
import type { BlockConstructable } from './types';

interface RouteProps {
  rootQuery: string;
}

export class Route {
  private _pathname: string;
  private _blockClass: BlockConstructable;
  private _block: Block | null = null;
  private _props: RouteProps;

  constructor(
    pathname: string,
    view: BlockConstructable,
    props: RouteProps
  ) {
    this._pathname = pathname;
    this._blockClass = view;
    this._props = props;
  }

  public match(pathname: string): boolean {
    return this._pathname === pathname;
  }

  public render():void {
    if (!this._block) {
      this._block = new this._blockClass();
    }

    const root = document.querySelector(this._props.rootQuery);

    if (!root) {
      throw new Error('Root element not found');
    }

    const content = this._block.element();
    if (!content) {
      throw new Error('Element not found');
    }
    root.replaceChildren(content);
  }
}
