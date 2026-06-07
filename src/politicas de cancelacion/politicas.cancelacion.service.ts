import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PoliticasBodyDto } from "./dto/politicas.cancelacion.body.dto";
import { PoliticaParamDto } from "./dto/politicas.cancelacion.param.dto";

@Injectable()
export class PoliticasCancelacionService{
    constructor(private readonly prisma: PrismaService){}

    async getPoliticas(){
        const politicas = await this.prisma.politicaCancelacion.findMany();
        if(politicas.length === 0){
            throw new NotFoundException('Politicas de Cancelacion no existente');
        }
        return politicas;
    }

    async createPoliticas(dto: PoliticasBodyDto){
        const newPoliticas = await this.prisma.politicaCancelacion.create({
            data: dto
        });
        return newPoliticas;
    }

    async updatePoliticas(dtoP: PoliticaParamDto, dtoB: PoliticasBodyDto){
        const findPoliticas = await this.prisma.politicaCancelacion.findUnique({
            where: {id: BigInt(dtoP.id)}
        });
        if(!findPoliticas){
            throw new NotFoundException('Politica de Cancelacion no existente');
        }
        await this.prisma.politicaCancelacion.update({
            where: {id: BigInt(dtoP.id)},
            data: dtoB
        });
        return 'Politica de Cancelacion actualiada con exito.'
    }
}