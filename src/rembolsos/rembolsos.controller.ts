import { Controller, Post, Get, Body } from "@nestjs/common";
import { RembolsosService } from "./rembolsos.services";
import { RembolsosBodyDto } from "./dto/rembolsos.body.dto";
import { FilterBodyDto } from "./dto/reembolsos.filters.dto";

@Controller('rembolso')
export class RemolsosController{
    constructor(private readonly rembolsoService: RembolsosService){}

    @Post()
    createRembolso(
        @Body() dto: RembolsosBodyDto
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