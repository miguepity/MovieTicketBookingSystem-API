import { Controller, Post, Body, Param, ParseIntPipe } from "@nestjs/common";
import { PasswordResetService } from "./passwordresetservices";
import { BodyDto } from "./dto/passwordreset.body.dto"

@Controller('auth')
export class PasswordResetTokenController{
    constructor(private readonly passwordReset: PasswordResetService){}

    @Post('forgot-password')
    forgotPassword(
        @Body() dto: BodyDto,
    ){
        try{
            return this.passwordReset.forgotPassword(dto);
        }catch(error){
            return 'Internal error';
        }
    }

    @Post('reset-password/:id')
    resetPassword(
        @Param('id', ParseIntPipe) id_usuario: number,
    ){
        try{
            return this.passwordReset.resetPassword({id_usuario});
        }catch(error){
            return 'Internal error';
        }
    }

}