import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-facebook";


@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy,'facebook'){

    constructor(){
        super({
            clientID: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            callbackURL: `${process.env.BACKEND_API}/api/auth/facebook/callback`,
            scope:["public_profile","email"],
            profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
        })
    }

    validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
        return profile
    }
    
}