import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Global exception filter.
 *
 * Handles:
 *  - NestJS HttpException           → forward status + message as-is
 *  - Prisma P2002 (unique)          → 409 Conflict
 *  - Prisma P2003 (FK violation)    → 409 Conflict
 *  - Prisma P2025 (record missing)  → 404 Not Found
 *  - Everything else                → 500 Internal Server Error (logged)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // ── NestJS HTTP exceptions ────────────────────────────────────────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else {
        const raw = (body as { message?: string | string[] }).message;
        message = Array.isArray(raw) ? raw.join('; ') : (raw ?? message);
      }

    // ── Prisma known request errors ────────────────────────────────────────────
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          const fields = (exception.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
          status  = HttpStatus.CONFLICT;
          message = `A record with that ${fields} already exists`;
          break;
        }
        case 'P2003':
          status  = HttpStatus.CONFLICT;
          message = 'Cannot complete this action: referenced record does not exist or is still in use';
          break;
        case 'P2025':
          status  = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        default:
          this.logger.error(
            `Unhandled Prisma error [${exception.code}]: ${exception.message}`,
            exception.stack,
          );
      }

    // ── Prisma validation errors ───────────────────────────────────────────────
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status  = HttpStatus.BAD_REQUEST;
      message = 'Invalid data sent to the database';
      this.logger.warn(exception.message);

    // ── Unknown errors ─────────────────────────────────────────────────────────
    } else {
      this.logger.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
