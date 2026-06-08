import { Controller, Post, Get, Body } from "@nestjs/common";
import { ReembolsosService } from "./reembolsos.services";
import { ReembolsosBodyDto } from "./dto/reembolsos.body.dto";
import { FilterBodyDto } from "./dto/reembolsos.filters.dto";

@Controller('reembolso')
export class ReemolsosController{
    constructor(private readonly rembolsoService: ReembolsosService){}

    @Post()
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
    getPaymentHistory(
        @Body() dto: FilterBodyDto
    ){
        try{
            return this.rembolsoService.getPaymentHistory(dto);
        }catch(error){
            return 'Internal server error'
        }
    }
}