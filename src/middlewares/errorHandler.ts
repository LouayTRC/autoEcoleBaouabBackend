import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class ErrorHandler implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let messages: { field?: string; message: string }[] = [{ message: "Une erreur est survenue" }];

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                messages = [{ message: res }];
            } else if (typeof res === 'object' && res != null) {
                const obj = res as Record<string, any>;

    
                if (Array.isArray(obj.message)) {
                    messages = obj.message.map(m => {
                     
                        if (typeof m === 'string') return { message: m };
                        return m;
                    });
                } else if (typeof obj.message === 'string') {
                    messages = [{ message: obj.message }];
                }
            }
        } else if (exception instanceof Error) {
            messages = [{ message: exception.message }];
        }

        response.status(status).json({
            success: false,
            messages,
            timestamp: new Date().toISOString(),
        });
    }
}
