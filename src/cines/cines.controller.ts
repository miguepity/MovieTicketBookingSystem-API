import { Controller, Post, Get, Put, Param, Body, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { CineService } from "./cines.service";
import { BodyDto } from "./dto/cine.body";
import { EditBodyDto } from "./dto/cine.edit.body";
import { ParamDto } from "./dto/cine.param";

@ApiTags('Cines')
@Controller('cines')
export class CineController{
    constructor(private readonly cineService: CineService){}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo cine' })
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
    @ApiOperation({ summary: 'Obtener funciones disponibles de un cine' })
    @ApiParam({ name: 'id', description: 'ID del cine' })
    getFuncionesDisponibles(
        @Param('id', ParseIntPipe) id: number
    ){
        return this.cineService.getFuncionesDisponibles(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Editar datos de un cine' })
    @ApiParam({ name: 'id', description: 'ID del cine' })
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
