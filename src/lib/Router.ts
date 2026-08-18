import { Route } from './Route';
import type { BlockConstructable } from './types';
import { store } from '../utils/Store';

export class Router {
  private static instance: Router | null = null;

  private routes: Route[] = [];

  private notFoundRoute: Route;

  private rootQuery: string;

  constructor(notFoundRoute: Route, rootQuery: string) {
    this.notFoundRoute = notFoundRoute;
    this.rootQuery = rootQuery;

    Router.instance = this;
  }

  public static getInstance(): Router {
    if (!Router.instance) {
      throw new Error('Router is not initialized');
    }

    return Router.instance;
  }

  public use(pathname: string, block: BlockConstructable): Router {
    this.routes.push(
      new Route(
        pathname,
        block,
        {
          rootQuery: this.rootQuery,
        },
      ),
    );

    return this;
  }

  public start(): void {
    this._onRoute(window.location.pathname);

    window.addEventListener('popstate', () => {
      this._onRoute(window.location.pathname);
    });

    this.link();
  }

  private _onRoute(pathname: string): void {
    const user = store.getState().user;

    const publicRoutes = ['/', '/sign-up'];

    if (!user && !publicRoutes.includes(pathname)) {
      window.history.replaceState({}, '', '/');
      this._onRoute('/');
      return;
    }

    if (user && publicRoutes.includes(pathname)) {
      this.go('/messenger');
      return;
    }

    const route = this.routes.find(
      (route) => route.match(pathname),
    );

    if (route) {
      route.render();
    } else {
      this.notFoundRoute.render();
    }
  }

  public go(pathname: string): void {
    window.history.pushState({}, '', pathname);
    this._onRoute(pathname);
  }

  public link(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      const link = target.closest('a');

      if (
        !link ||
        link.origin !== window.location.origin ||
        link.target === '_blank'
      ) {
        return;
      }

      const href = link.getAttribute('href');

      if (!href) {
        return;
      }

      event.preventDefault();

      this.go(href);
    });
  }
}
