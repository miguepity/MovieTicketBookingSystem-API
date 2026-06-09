import { Body, Controller, Post, Get, Put, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { SalaService } from "./salas.service";
import { Param } from "@nestjs/common";
import { BodyDto } from "./dto/salas.body.dto";

@ApiTags('Salas')
@Controller('salas')
export class SalasController{
    constructor(private readonly salaService: SalaService){}

    @Post()
    @ApiOperation({ summary: 'Crear una nueva sala' })
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
    @ApiOperation({ summary: 'Obtener todas las salas' })
    getSalas(){
        try{
            return this.salaService.getSalas();
        }catch(error){
            return 'Internal server error'
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una sala por ID' })
    @ApiParam({ name: 'id', description: 'ID de la sala' })
    getSalaById(
        @Param('id', ParseIntPipe) id: number
    ){
        try{
            return this.salaService.getSalaById({id});
        }catch(error){
            return 'Internal server error'
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una sala' })
    @ApiParam({ name: 'id', description: 'ID de la sala' })
    editSala(
        @Param('id', ParseIntPipe) id: number,
        @Body() dtoB: BodyDto
    ){
        try{
            return this.salaService.updateSala({id}, dtoB);
        }catch(error){
            return 'Internal server error'
        }
    }
}