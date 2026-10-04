import { vi } from 'vitest';
import { Router } from './Router';
import { Route } from './Route';
import { Block } from './Block';
import { store } from '../utils/Store';

class TestBlock extends Block {
  protected template = '<div>Test block</div>';
}

describe('Router', () => {

  it('сохраняет созданный экземпляр и возвращает его через getInstance', () => {
    const notFoundRoute = {
      render: vi.fn(),
    } as unknown as Route;

    const router = new Router(notFoundRoute, '#app');

    expect(Router.getInstance()).toBe(router);
  });

  it('use возвращает экземпляр Router', () => {
    const notFoundRoute = {
      render: vi.fn(),
    } as unknown as Route;

    const router = new Router(notFoundRoute, '#app');

    const result = router.use('/test', TestBlock);

    expect(result).toBe(router);
  });

  it('go переходит на зарегистрированный маршрут', () => {
    document.body.innerHTML = '<div id="app"></div>';

    const notFoundRoute = {
      render: vi.fn(),
    } as unknown as Route;

    const router = new Router(notFoundRoute, '#app');

    router.use('/test', TestBlock);

    store.set('user', { id: 1 });

    router.go('/test');

    expect(window.location.pathname).toBe('/test');
    expect(document.querySelector('#app')?.textContent).toBe('Test block');
  });

  it('рендерит notFoundRoute для неизвестного маршрута', () => {
    document.body.innerHTML = '<div id="app"></div>';

    const notFoundRoute = {
      render: vi.fn(),
    } as unknown as Route;

    const router = new Router(notFoundRoute, '#app');

    store.set('user', { id: 1 });

    router.go('/unknown');

    expect(notFoundRoute.render).toHaveBeenCalled();
  });

  it('перенаправляет неавторизованного пользователя на главную', () => {
    document.body.innerHTML = '<div id="app"></div>';

    const notFoundRoute = {
      render: vi.fn(),
    } as unknown as Route;

    const router = new Router(notFoundRoute, '#app');

    store.set('user', undefined);

    router.go('/messenger');

    expect(window.location.pathname).toBe('/');
  });

  it('перенаправляет авторизованного пользователя на messenger', () => {
    document.body.innerHTML = '<div id="app"></div>';

    const notFoundRoute = {
      render: vi.fn(),
    } as unknown as Route;

    const router = new Router(notFoundRoute, '#app');

    store.set('user', { id: 1 });

    router.go('/');

    expect(window.location.pathname).toBe('/messenger');
  });

  it('go изменяет историю через pushState', () => {
    document.body.innerHTML = '<div id="app"></div>';

    const notFoundRoute = {
      render: vi.fn(),
    } as unknown as Route;

    const router = new Router(notFoundRoute, '#app');

    store.set('user', { id: 1 });

    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    router.go('/test');

    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/test');

    pushStateSpy.mockRestore();
  });
});
