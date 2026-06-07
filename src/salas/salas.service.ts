import { Injectable, NotFoundException } from "@nestjs/common";
import { BodyDto } from "./dto/salas.body.dto";
import { ParamDto } from "./dto/salas.param.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SalaService{
    constructor(private readonly prisma: PrismaService){}

    async createSala(dto: BodyDto){
        const findCine = await this.prisma.cines.findFirst({
            where: {id: dto.id_cine}
        }); 
        if(findCine){
            throw new NotFoundException('Cine not found');
        }
        const newCine = await this.prisma.salas.create({
            data: dto
        });
    }

    async getSalas(){
        const salas = await this.prisma.salas.findMany();
        if(salas.length === 0){
            throw new NotFoundException('Cines is empty');
        }
        return salas;
    }

    async getSalaById(dto: ParamDto){
        const findSala = await this.prisma.salas.findFirst({
            where: {id: dto.id}
        }); 
        if(!findSala){
            throw new NotFoundException('Sala not found');
        }
        return findSala;
    }

    async updateSala(dtoP: ParamDto, dtoB: BodyDto){
        const findSala = await this.prisma.salas.findFirst({
            where: {id: dtoP.id}
        }); 
        if(!findSala){
            throw new NotFoundException('Sala not found');
        }
        await this.prisma.salas.update({
            where: {id: dtoP.id},
            data: dtoB
        });
        return 'Sala updated succesfully';
    }  
}