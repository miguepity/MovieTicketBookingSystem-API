import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'LuhnValid', async: false })
class LuhnValidConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) return false;
    let sum = 0;
    let doubled = false;
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = value.charCodeAt(i) - 48;
      if (doubled) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      doubled = !doubled;
    }
    return sum % 10 === 0;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Número de tarjeta inválido';
  }
}

export function LuhnValid(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyKey as string,
      options,
      constraints: [],
      validator: LuhnValidConstraint,
    });
  };
}
