import { Controller, Post, Get, Put, Param, Body, ParseIntPipe } from "@nestjs/common";
import { CineService } from "./cines.service";
import { BodyDto } from "./dto/cine.body";
import { EditBodyDto } from "./dto/cine.edit.body";
import { ParamDto } from "./dto/cine.param";

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
        @Body() dtoB: EditBodyDto
    ){
        try{
            return this.cineService.editCine({id}, dtoB);
        }catch(error){
            return 'Internal server error';
        }
    }
}
