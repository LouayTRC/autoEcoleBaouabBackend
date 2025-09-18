import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthenticateGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = request.cookies?.jwt;

        if (!token) {
            throw new UnauthorizedException('Token manquant ou invalide');
        }

        try {
            const decoded = this.jwtService.verify(token);
            request.user_id = decoded.user_id;
            request.user_role = decoded.user_role;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Token invalide ou expiré');
        }
    }
}
