import { Link } from "./link";

describe('InputProfile', () => {
  it('рендерит текст и устанавливает href', () => {
    const link = new Link({
      text: 'Зарегистрироваться',
      href: '/sign-up',
    });

    const element = link.element();

    expect(element?.textContent?.trim()).toBe('Зарегистрироваться');
    expect(element?.getAttribute('href')).toBe('/sign-up');
  });
  
  it('добавляет className, если он передан', () => {
    const link = new Link({
      text: 'Зарегистрироваться',
      href: '/sign-up',
      className: 'custom-link',
    });

    const element = link.element();

    expect(element?.classList.contains('custom-link')).toBe(true);
  });
});
