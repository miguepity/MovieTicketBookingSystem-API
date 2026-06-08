import { Controller, Post, Get, Body, Patch, Param, ParseIntPipe } from "@nestjs/common";
import { ReservasService } from "./reservas.service";
import { ReservasBodyDto } from "./dto/reservas.body.dto";
import { ReservasFilterDto } from "./dto/reservas.filter.dto";

@Controller('reservas')
export class ReservasController{
    constructor(private readonly reservasService: ReservasService){}

    @Post()
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
    exportReservas(){
        try{
            return this.reservasService.exportReservas();
        }catch(error){
            return 'Internal server error'
        }
    }

    @Patch(':id/cancelar')
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