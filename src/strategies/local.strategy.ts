import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { AuthService } from "src/crud/auth/auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    
    constructor(private authService:AuthService){
        super({usernameField:'identifiant'});
    }

    async validate(identifiant:string,password:string){
        const user=await this.authService.validateUser(identifiant,password);

        if (!user) {
            throw new UnauthorizedException("Identifiant ou mot de passe incorrect !");
        }
        return user
    }
    
}