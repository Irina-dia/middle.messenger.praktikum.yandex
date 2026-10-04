import Handlebars from 'handlebars';
import type {HelperOptions} from 'handlebars';
import type { Block } from './Block';

type ComponentClass<T extends object = object> = {
  new (props?: T): Block<T>;
  componentName: string;
};

function registerComponent<T extends object>(Component: ComponentClass<T>) {

  Handlebars.registerHelper(
    Component.componentName,
    function (this: unknown, { hash, data }: HelperOptions) {
      const uniqueId = crypto.randomUUID();
      const dataAttribute = `data-component-hbs-id="${uniqueId}"`;
      const component = new Component(hash as T);

      if ('ref' in hash) {
        (data.root.__refs = data.root.__refs || {})[hash.ref] = component.element();
      }

      (data.root.__children = data.root.__children || []).push({
        component,
        embed(node: DocumentFragment) {
          const placeholder = node.querySelector(`[${dataAttribute}]`);
          if (!placeholder) {
            throw new Error(`Can't find data-id for component ${Component.componentName}`);
          }

          const element = component.element();
          if (!element) {
            throw new Error('Component element is not created');
          }

          placeholder.replaceWith(element);
        }
      });

      return `<div ${dataAttribute}></div>`;
    }
  );
}

export {registerComponent};
