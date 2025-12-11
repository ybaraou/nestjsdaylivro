import { ValidationError } from 'class-validator';
import { ValidationException } from './validation.exception';

export function myValidationError(errors: ValidationError[]) {
  const messages = {};
  errors.forEach((error) => {
    let message = '';
    for (const fieldError in error.constraints) {
      message = `${message}\n${error.constraints[fieldError]}`;
    }
    message = message.replace('\n', '');
    messages[error.property] = message;
  });
  return new ValidationException(messages);
}
