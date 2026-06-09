import { Controller, Post, Get, Body, Param, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { ReembolsosService } from "./reembolsos.services";
import { ReembolsosBodyDto } from "./dto/reembolsos.body.dto";
import { FilterBodyDto } from "./dto/reembolsos.filters.dto";

@ApiTags('Reembolsos')
@Controller('reembolso')
export class ReemolsosController{
    constructor(private readonly rembolsoService: ReembolsosService){}

    @Post()
    @ApiOperation({ summary: 'Crear una solicitud de reembolso' })
    createRembolso(
        @Body() dto: ReembolsosBodyDto
    ){
        try{
            return this.rembolsoService.createRembolso(dto);
        }catch(error){
            return 'Internal server error'
        }
    }

    @Get('pagos')
    @ApiOperation({ summary: 'Obtener historial de pagos con filtros' })
    getPaymentHistory(
        @Body() dto: FilterBodyDto
    ){
        try{
            return this.rembolsoService.getPaymentHistory(dto);
        }catch(error){
            return 'Internal server error'
        }
    }

    @Get(':id/calculo')
    @ApiOperation({ summary: 'Calcular monto de reembolso para una reserva' })
    @ApiParam({ name: 'id', description: 'ID de la reserva' })
    calculoDeReembolso(
        @Param('id', ParseIntPipe) id: number
    ){
        try{
            return this.rembolsoService.calcularReembolso(id);
        }catch(error){
            return 'Internal server error'
        }
    }
}