import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ReembolsosBodyDto } from "./dto/reembolsos.body.dto"
import { FilterBodyDto } from "./dto/reembolsos.filters.dto";

@Injectable()
export class ReembolsosService{
    constructor(private readonly prisma: PrismaService){}

    async createRembolso(dto: ReembolsosBodyDto){
        const findPago = await this.prisma.pagos.findUnique({
            where: {id: BigInt(dto.id_pago)}
        });
        if(!findPago){
            throw new NotFoundException('No se encontro el Pago');
        }

        await this.prisma.pagos.update({
            where: {id: BigInt(dto.id_pago)},
            data: {estado: 'rembolsado'}
        });

        const newRem = await this.prisma.reembolsos.create({
            data: dto
        });

        return {
            message: 'Estado de pago rembolsado',
            newRem
        };
    }

    async getPaymentHistory(dto: FilterBodyDto){
        const findPagos = await this.prisma.pagos.findMany({
            where: {estado: dto.estado}
        });
        const findRembolsos = await this.prisma.reembolsos.findMany();

        const filterPagos = dto.created_at?
        findPagos.filter((pag) => {
            pag.created_at.getTime() >= dto.created_at.getTime()
        }): findPagos

        const filterRemboolsos = dto.fecha_procesado? 
        findRembolsos.filter((rem) => {
            rem.fecha_procesado!=null &&
            rem.fecha_procesado.getTime() >= dto.fecha_procesado.getTime()
        }): findRembolsos
    
        if(findPagos.length === 0 && findRembolsos.length === 0){
            throw new NotFoundException('No existe historial de pago y rembolsos');
        }

        return {
            pagos: filterPagos,
            reembolso: filterRemboolsos
        }
    }
}
