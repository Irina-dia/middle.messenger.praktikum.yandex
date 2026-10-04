import { Button } from './button';

describe('Button', () => {
  it('рендерит переданный label и type', () => {
    const button = new Button({
      label: 'Войти',
      type: 'submit',
    });

    const element = button.element();

    expect(element?.textContent?.trim()).toBe('Войти');
    expect(element?.getAttribute('type')).toBe('submit');
  });

  it('добавляет className и id, если они переданы', () => {
    const button = new Button({
      label: 'Войти',
      type: 'submit',
      className: 'login-button',
      id: 'login',
    });

    const element = button.element();

    expect(element?.className).toBe('button login-button');
    expect(element?.id).toBe('login');
  });
});
