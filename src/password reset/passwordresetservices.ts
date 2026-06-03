import { PrismaService } from "../prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ParamDto } from "./dto/passwordreset.param.dto";
import { BodyDto } from "./dto/passwordreset.body.dto"

@Injectable()
export class PasswordResetService{
    constructor(private readonly prisma: PrismaService){}

    async forgotPassword(dto: BodyDto){
        const findeUser = await this.prisma.usuarios.findFirst({
            where: {id: dto.id_usuario}
        });
        if(!findeUser){
            throw new NotFoundException('User not found.');
        }
        const newToken = await this.prisma.passwordResetToken.create({
            data: dto
        });
        return newToken;
    }

    async resetPassword(dto: ParamDto){
        const foundToken = await this.prisma.passwordResetToken.findFirst({
            where: {id_usuario: dto.id_usuario}
        })
        if(!foundToken){
            throw new NotFoundException('Token not found.');
        }
        if(foundToken.expires_at.getTime() < new Date().getTime()){
            throw new NotFoundException('Token expired.');
        }
        await this.prisma.passwordResetToken.update({
            where: {id: foundToken.id},
            data: {usado: true}
        })
        await this.prisma.passwordResetToken.create({
            data: {id_usuario: dto.id_usuario, token: foundToken.token, expires_at: new Date()}
        });
        return 'Password actualizada con exito.';
    }
}