import { Title } from './title';

describe('Title', () => {
  it('рендерит переданный title', () => {
    const title = new Title({
      title: 'Мой заголовок',
    });

    const element = title.element();

    expect(element?.textContent?.trim()).toBe('Мой заголовок');
  });

  it('добавляет className, если он передан', () => {
    const title = new Title({
      title: 'Мой заголовок',
      className: 'custom-title',
    });

    const element = title.element();

    expect(element?.className).toBe(
      'title title__type-first custom-title',
    );
  });
});
