import { Paragraph } from './paragraph';

describe('Paragraph', () => {
  it('рендерит переданный текст', () => {
    const paragraph = new Paragraph({
      text: 'Это текст параграфа',
    });

    const element = paragraph.element();

    expect(element?.textContent?.trim()).toBe('Это текст параграфа');
  });

  it('добавляет className, если он передан', () => {
    const paragraph = new Paragraph({
      text: 'Это текст параграфа',
      className: 'custom-paragraph',
    });

    const element = paragraph.element();

    expect(element?.classList.contains('custom-paragraph')).toBe(true);
  });
});
