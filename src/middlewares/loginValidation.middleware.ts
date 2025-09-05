import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { loginSchema } from 'src/validation/requests/auth.validators';


@Injectable()
export class LoginValidationMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      throw new BadRequestException(error.message);
    }
    next();
  }
}
