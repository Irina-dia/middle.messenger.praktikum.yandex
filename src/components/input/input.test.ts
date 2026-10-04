import { Input } from './input';

describe('Input', () => {
  it('рендерит обязательные переданные свойства: name, type, placeholder, label', () => {
    const input = new Input({
      name: 'login',
      type: 'text',
      placeholder: 'Введите логин',
      label: 'Логин',
    });

    const element = input.element();
    const inputElement = element?.querySelector('input');

    expect(
      element?.querySelector('.input__label')?.textContent?.trim(),
    ).toBe('Логин');

    expect(inputElement?.getAttribute('name')).toBe('login');
    expect(inputElement?.getAttribute('type')).toBe('text');
    expect(inputElement?.getAttribute('placeholder')).toBe('Введите логин');
  });

  it('добавляет className, если он передан', () => {
    const input = new Input({
      name: 'login',
      type: 'text',
      placeholder: 'Введите логин',
      label: 'Логин',
      className: 'custom-input',
    });

    const element = input.element();
    const inputElement = element?.querySelector('input');

    expect(inputElement?.classList.contains('custom-input')).toBe(true);
  });
});
