import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { RoleService } from "src/crud/role/role.service";

@Injectable()
export class RoleGuard implements CanActivate {

    constructor(
        private roleService: RoleService,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userId = request.user_id;
        const roleId = request.user_role;

        if (!userId || !roleId) {
            throw new ForbiddenException('Utilisateur non authentifié');
        }

        const roleResult = await this.roleService.getRoleById(roleId);
        if (!roleResult.data) {
            throw new NotFoundException("Ce role n'existe pas !")
        }
       
        if (!roles.includes(roleResult.data.name)) {
            throw new ForbiddenException('Accès refusé : rôle non autorisé');
        }

        return true
    }

}