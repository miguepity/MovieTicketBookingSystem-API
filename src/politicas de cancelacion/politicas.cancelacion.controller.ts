import { Controller, Post, Get, Body, Param, Put, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { PoliticasCancelacionService } from "./politicas.cancelacion.service";
import { PoliticasBodyDto } from "./dto/politicas.cancelacion.body.dto";

@ApiTags('Políticas de Cancelación')
@Controller('politica-cancelacion')
export class PoliticasCancelacionController{
    constructor(private readonly politicasService: PoliticasCancelacionService){}

    @Get()
    @ApiOperation({ summary: 'Listar todas las políticas de cancelación' })
    getPoliticas(){
        try{
            return this.politicasService.getPoliticas();
        }catch(error){
            return 'Internal server error';
        }
    }

    @Post()
    @ApiOperation({ summary: 'Crear una política de cancelación' })
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
    @ApiOperation({ summary: 'Actualizar una política de cancelación' })
    @ApiParam({ name: 'id', description: 'ID de la política' })
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
