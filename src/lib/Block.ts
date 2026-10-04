import Handlebars from "handlebars";

type EventListType = Partial<Record<keyof HTMLElementEventMap, (e: Event) => void>>;

interface BlockOwnProps {
  __children?: Array<{
    component: Block<object>;
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Record<string, Element>;
}

export abstract class Block<Props extends object = object> {
  protected abstract template: string;
  protected props = {} as Props;
  protected refs: Record<string, Element> = {};
  protected events: EventListType = {};
  protected children: Block<object>[] = [];

  private domElement: Element | null = null;

  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  public element(): Element | null {
    if(!this.domElement) {
      this.render();
    }
    return this.domElement;
  }

  public setProps(props: Partial<Props>) {
    this.props = { ...this.props, ...props, __children: [], __refs: {} };
    this.render();
  }

  protected render() {
    this.unmountComponent();
    const fragment = this.compile();

    if(this.domElement && fragment) {
      this.domElement.replaceWith(fragment);
    }

    this.domElement = fragment;
    this.mountComponent();
  }

  protected componentDidMount(): void {}
  protected componentWillUnmount(): void {}

  private compile(): Element | null {
    const compileProps = this.props as Props & BlockOwnProps;
    const html = Handlebars.compile(this.template)(compileProps);
    const templateElement = document.createElement('template');
    templateElement.innerHTML = html;
    const fragment = templateElement.content;

    if (compileProps.__children) {
      this.children = compileProps.__children.map((child) => child.component);

      compileProps.__children.forEach((child) => {
        child.embed(fragment);
      });
    }

    const defaultRefs = compileProps.__refs ?? {};
    this.refs = Array.from(fragment.querySelectorAll('[ref]')).reduce(
      (list, element) => {
        const key = element.getAttribute('ref') as string;
        list[key] = element as HTMLElement;
        element.removeAttribute('ref');
        return list;
      },
      defaultRefs,
    );

    return templateElement.content.firstElementChild;
  }

  private mountComponent() {
    this.attachListeners();
    this.componentDidMount();
  }

  private unmountComponent() {
    if (this.domElement) {
      this.children.reverse().forEach(child => child.unmountComponent());

      this.removeListeners();
      this.componentWillUnmount();
    }
  }

  private attachListeners() {
    for (const eventName in this.events) {
      const eventCallback = this.events[eventName as keyof HTMLElementEventMap];
      if (typeof eventCallback == "function" && this.domElement) {
        this.domElement.addEventListener(eventName, eventCallback);
      }
    }
  }

  private removeListeners() {
    for (const eventName in this.events) {
      const eventCallback = this.events[eventName as keyof HTMLElementEventMap];
      if (typeof eventCallback == "function" && this.domElement) {
        this.domElement.removeEventListener(eventName, eventCallback);
      }
    }
  }
}
