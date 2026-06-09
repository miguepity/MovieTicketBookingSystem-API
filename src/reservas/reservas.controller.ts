import { Controller, Post, Get, Body, Patch, Param, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";

import { ReservasService } from "./reservas.service";
import { ReservasBodyDto } from "./dto/reservas.body.dto";
import { ReservasFilterDto } from "./dto/reservas.filter.dto";

@ApiTags('Reservas')
@Controller('reservas')
export class ReservasController{
    constructor(private readonly reservasService: ReservasService){}

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una reserva por ID' })
    @ApiParam({ name: 'id', description: 'ID de la reserva' })
    getReservaById(
        @Param('id', ParseIntPipe) id: number
    ){
        try{
            return this.reservasService.getReservaById(id);
        }catch(error){
            return 'Internal server error'
        }
    }

    @Post()
    @ApiOperation({ summary: 'Crear una reserva' })
    createReserva(
        @Body() dto: ReservasBodyDto
    ){
        try{
            return this.reservasService.createReserva(dto);
        }catch(error){
            return 'Internal server error'
        }
    }

    @Get()
    @ApiOperation({ summary: 'Listar reservas con filtros opcionales' })
    getReservas(
        @Body() dto: ReservasFilterDto
    ){
        try{
            return this.reservasService.getReservas(dto);
        }catch(error){
            return 'Internal server error'
        }
    }

    @Get('export')
    @ApiOperation({ summary: 'Exportar reservas' })
    exportReservas(){
        try{
            return this.reservasService.exportReservas();
        }catch(error){
            return 'Internal server error'
        }
    }

    @Patch(':id/cancelar')
    @ApiOperation({ summary: 'Cancelar una reserva' })
    @ApiParam({ name: 'id', description: 'ID de la reserva' })
    cancelReserva(
        @Param('id', ParseIntPipe) id: number
    ){
        try{
            return this.reservasService.cancelarReserva(id);
        }catch(error){
            return 'Internal server error'
        }
    }
}