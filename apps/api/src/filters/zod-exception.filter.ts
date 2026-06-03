import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from "@nestjs/common";
import { ZodError } from "zod";

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();
    const body = {
      statusCode: HttpStatus.BAD_REQUEST,
      error: "Bad Request",
      message: "Validation failed",
      issues: exception.issues.map((i) => ({
        path: i.path,
        message: i.message,
      })),
    };
    // Works with both Fastify and Express adapters
    response.status(HttpStatus.BAD_REQUEST).send(body);
  }
}
