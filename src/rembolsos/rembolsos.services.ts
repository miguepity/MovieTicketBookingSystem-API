import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RembolsosBodyDto } from "./dto/rembolsos.body.dto"
import { FilterBodyDto } from "./dto/reembolsos.filters.dto";

@Injectable()
export class RembolsosService{
    constructor(private readonly prisma: PrismaService){}

    async createRembolso(dto: RembolsosBodyDto){
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
            where: dto
        });
        const findRembolsos = await this.prisma.reembolsos.findMany({
            where: dto
        });
        
        if(findPagos.length === 0 && findRembolsos.length === 0){
            throw new NotFoundException('No existe historial de pago y rembolsos');
        }

        return {
            findPagos,
            findRembolsos
        }
    }
}
