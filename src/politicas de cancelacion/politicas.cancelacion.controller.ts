import { Controller, Post, Get, Body, Param, Put, ParseIntPipe } from "@nestjs/common";
import { PoliticasCancelacionService } from "./politicas.cancelacion.service";
import { PoliticasBodyDto } from "./dto/politicas.cancelacion.body.dto";

@Controller('politica-cancelacion')
export class PoliticasCancelacionController{
    constructor(private readonly politicasService: PoliticasCancelacionService){}

    @Get()
    getPoliticas(){
        try{
            return this.politicasService.getPoliticas();
        }catch(error){
            return 'Internal server error';
        }
    }

    @Post()
    createPolitica(
        @Body() dto: PoliticasBodyDto
    ){
        try{
            return this.politicasService.createPoliticas(dto);
        }catch(error){
            return 'Internal server error';
        }
    }

    @Put(':id')
    editPolitica(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: PoliticasBodyDto
    ){
        try{
            return this.politicasService.updatePoliticas({id}, dto);
        }catch(error){
            return 'Internal server error';
        }
    }
}
