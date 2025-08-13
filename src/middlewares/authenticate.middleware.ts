import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {

    constructor(private readonly jwtService: JwtService) { }

    use(req: any, res: any, next: (error?: any) => void) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token manquant ou invalide');
        }
        try {
            const token = authHeader.split(' ')[1];
            const decoded = this.jwtService.verify(token);
            req['user_id'] = decoded.user_id;
            req['user_role'] = decoded.user_role;
            next();

        } catch (err) {
            throw new UnauthorizedException('Token invalide ou expiré');
        }
    }

}