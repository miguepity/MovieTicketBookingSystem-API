import { Body, Controller, Post, Get, Put, ParseIntPipe } from "@nestjs/common";
import { SalaService } from "./salas.service";
import { Param } from "@nestjs/common";
import { BodyDto } from "./dto/salas.body.dto";

@Controller('salas')
export class SalasController{
    constructor(private readonly salaService: SalaService){}

    @Post()
    createSala(
        @Body() dto: BodyDto
    ){
        try{
            return this.salaService.createSala(dto);
        }catch(error){
            return 'Internal server error'
        }
    }

    @Get()
    getSalas(){
        try{
            return this.salaService.getSalas();
        }catch(error){
            return 'Internal server error'
        }
    }

    @Get(':id')
    getSalaById(
        @Param(':id', ParseIntPipe) id: number
    ){
        try{
            return this.salaService.getSalaById({id});
        }catch(error){
            return 'Internal server error'
        }
    }

    @Put(':id')
    editSala(
        @Param(':id', ParseIntPipe) id: number,
        @Body() dtoB: BodyDto
    ){
        try{
            return this.salaService.updateSala({id}, dtoB);
        }catch(error){
            return 'Internal server error'
        }
    }
}