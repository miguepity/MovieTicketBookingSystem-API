import { Controller, Get, Post, Param, Body, ParseIntPipe, Put } from "@nestjs/common";
import { CineService } from "./cines.service";
import { BodyDto } from "./dto/cine.body";

@Controller('cines')
export class CineController{
    constructor(private readonly cineService: CineService){}

    @Post()
    createCine(
        @Body() dto: BodyDto
    ){
        try{    
            return this.cineService.createCine(dto);
        }catch(error){
            return 'Internal server error';
        }
    }

    @Get(':id/funciones')
    getFuncionesDisponibles(
        @Param('id', ParseIntPipe) id: number
    ){
        return this.cineService.getFuncionesDisponibles(id);
    }

    @Put()
    editCine(
        @Param('id', ParseIntPipe) id: number,
        @Body() dtoB: BodyDto
    ){
        try{    
            return this.cineService.editCine({id}, dtoB);
        }catch(error){
            return 'Internal server error';
        }
    }
}
