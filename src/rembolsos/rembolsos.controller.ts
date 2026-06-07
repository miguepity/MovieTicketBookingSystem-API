import { Controller, Post, Get, Body } from "@nestjs/common";
import { RembolsosService } from "./rembolsos.services";
import { RembolsosBodyDto } from "./dto/rembolsos.body.dto";

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
    getPaymentHistory(){
        try{
            return this.rembolsoService.getPaymentHistory();
        }catch(error){
            return 'Internal server error'
        }
    }
}