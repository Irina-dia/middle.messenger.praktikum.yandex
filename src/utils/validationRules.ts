export interface ValidationRule {
    regExp: RegExp;
    errorMessage: string;
}

export type FieldName =
    | 'first_name'
    | 'second_name'
    | 'display_name'
    | 'login'
    | 'email'
    | 'password'
    | 'phone'
    | 'message'
    | 'old_password'
    | 'new_password'
    | 'repeat_password';

const NAME_RULE: ValidationRule =  {
  regExp: /^[A-ZА-Я][a-zA-ZА-Яа-я]*(-[A-ZА-Я][a-zA-ZА-Яа-я]*)*$/,
  errorMessage: 'Текст в поле должен быть на латинице или кириллице, первая буква заглавная. Без пробелов и цифр, из спецсимволов — только дефис',
}

const PASSWORD_RULE: ValidationRule = {
  regExp: /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9_-]{8,40}$/,
  errorMessage: 'Пароль должен содержать 8–40 символов, минимум одну заглавную букву и одну цифру',
}

export const validationRules: Record<FieldName, ValidationRule> = {
  first_name: NAME_RULE,
  second_name: NAME_RULE,
  display_name: {
    regExp: /^(?!\d+$)[a-zA-Zа-яА-Я0-9_-]{3,20}$/,
    errorMessage: 'Отображаемое имя должно содержать латиницу, 3–20 символов, цифры, без пробелов, допустимы дефис и подчёркивание.',
  },  

  login: {
    regExp: /^(?!\d+$)[a-zA-Z0-9_-]{3,20}$/,
    errorMessage: 'Логин должен быть на латинице, содержать 3–20 символов, цифры, без пробелов, допустимы дефис и подчёркивание.',
  },

  email: {
    regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/,
    errorMessage: 'Почта должна быть на латинице, содержать цифры и спецсимволы. Обязательны @ и точка после него. Между @ и точкой должны быть буквы.',
  },
  
  phone: {
    regExp: /^\+?\d{10,15}$/,
    errorMessage: 'Телефон должен содержать от 10 до 15 цифр и может начинаться со знака "+"',
  },

  message: {
    regExp: /.*/,
    errorMessage: 'Поле не должно быть пустым',
  },

  password: PASSWORD_RULE,
  old_password: PASSWORD_RULE,
  new_password: PASSWORD_RULE,
  repeat_password: PASSWORD_RULE,
};