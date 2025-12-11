import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidationException } from './validation.exception';
import { Response } from 'express';

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    return response.status(400).json({
      error: 'Bad Request',
      type: 'Validation Errors',
      separator: '\n',
      totals: Object.keys(exception.validationErrors).length,
      statusCode: 400,
      validationErrors: exception.validationErrors,
    });
  }
}
