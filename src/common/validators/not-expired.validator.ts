import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'NotExpired', async: false })
class NotExpiredConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const m = value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!m) return false;
    const month = parseInt(m[1], 10);
    const year = 2000 + parseInt(m[2], 10);
    const now = new Date();
    const expiry = new Date(year, month, 1);
    return expiry.getTime() > now.getTime();
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'La tarjeta está vencida';
  }
}

export function NotExpired(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyKey as string,
      options,
      constraints: [],
      validator: NotExpiredConstraint,
    });
  };
}
