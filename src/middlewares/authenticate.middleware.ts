import { Injectable, NestMiddleware, Req, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {

    constructor(private readonly jwtService: JwtService) { }

    use(@Req() req: Request, res: any, next: (error?: any) => void) {
        const token = req.cookies?.jwt; 
        
        if (!token) {
            throw new UnauthorizedException('Token manquant ou invalide');
        }

        try {
            const decoded = this.jwtService.verify(token);
            req['user_id'] = decoded.user_id;
            req['user_role'] = decoded.user_role;
            next();
        } catch (err) {
            throw new UnauthorizedException('Token invalide ou expiré');
        }
    }


}