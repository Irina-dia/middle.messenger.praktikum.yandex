import { InputProfile } from './input-profile';

describe('InputProfile', () => {
  it('рендерит обязательные переданные свойства: name, type, value, label', () => {
    const input = new InputProfile({
      name: 'email',
      type: 'email',
      value: 'test@example.com',
      label: 'Электронная почта',
    });

    const element = input.element();
    const inputElement = element?.querySelector('input');

    expect(
      element?.querySelector('.profile__label')?.textContent?.trim(),
    ).toBe('Электронная почта');

    expect(inputElement?.getAttribute('name')).toBe('email');
    expect(inputElement?.getAttribute('type')).toBe('email');
    expect(inputElement?.getAttribute('value')).toBe('test@example.com');
  });

  it('делает input readonly, если isReadonly передан', () => {
    const input = new InputProfile({
      name: 'email',
      type: 'email',
      value: 'test@example.com',
      label: 'Электронная почта',
      isReadonly: true,
    });

    const element = input.element();
    const inputElement = element?.querySelector('input');

    expect(inputElement?.hasAttribute('readonly')).toBe(true);
  });
});
