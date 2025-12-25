import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string | string[];
    error?: string;
  };
}

@Catch()
export class StandardErrorExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(StandardErrorExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let statusCode: number;
    let message: string | string[];
    let error: string | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      message =
        typeof exceptionResponse === 'object' && exceptionResponse.message
          ? exceptionResponse.message
          : exception.message;

      error =
        typeof exceptionResponse === 'object' && exceptionResponse.error
          ? exceptionResponse.error
          : undefined;
    } else {
      // For non-HttpExceptions, log the detailed error
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
        `${request.method} ${request.url}`,
      );
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        statusCode,
        message,
        ...(error && { error }),
      },
    };

    response.status(statusCode).json(errorResponse);
  }
}
