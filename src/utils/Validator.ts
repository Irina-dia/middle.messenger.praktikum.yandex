import { validationRules} from './validationRules';
import type { FieldName } from './validationRules';

export class Validator {
  private form: HTMLFormElement;
  private inputs: Array<HTMLInputElement | HTMLTextAreaElement>;

  constructor(form: HTMLFormElement) {
    this.form = form;
    this.inputs = Array.from(
      this.form.querySelectorAll(
        'input:not([type="submit"]):not([type="button"]):not([type="hidden"]):not([type="reset"]), textarea'
      )
    );
  }

  public enable(): void {
    this.inputs.forEach((input) => {
      input.addEventListener('blur', () => {
        this.validateField(input)
      });
    });
  }

  public validateForm(): boolean {
    return this.inputs.every((input) => this.validateField(input));
  }

  public validateField(
    input: HTMLInputElement | HTMLTextAreaElement
  ): boolean {
    const rule = validationRules[input.name as FieldName];
    const value = input.value.trim();

    if (!rule) {
      return true;
    } 
    
    if (value === '') {
      this.showError(input, 'Обязательное поле');
      return false;
    }
    
    if (!rule.regExp.test(value)) {
      this.showError(input, rule.errorMessage);
      return false;
    }
    
    this.hideError(input);
    return true;
  }

  private getErrorElement(input: HTMLInputElement | HTMLTextAreaElement): HTMLElement | null {
    const errorElement = 
      input.closest('.input')?.querySelector('.input__error') ?? 
      input.closest('.profile__row')?.querySelector('.profile-input__error');
    
    if (!(errorElement instanceof HTMLElement)) {
      return null;
    }

    return errorElement;
  }

  private showError(input: HTMLInputElement | HTMLTextAreaElement, errorMessage: string): void {
    const errorElement = this.getErrorElement(input);
    
    if (!errorElement) {
      return;
    }

    errorElement.textContent = errorMessage;
    errorElement.classList.add('error_show');
  }

  private hideError(input: HTMLInputElement | HTMLTextAreaElement): void {
    const errorElement = this.getErrorElement(input);
    
    if (!errorElement) {
      return;
    }
    
    errorElement.textContent = '';
    errorElement.classList.remove('error_show');
  }
}