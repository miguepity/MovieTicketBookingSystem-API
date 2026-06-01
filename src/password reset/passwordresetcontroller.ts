import { Controller, Post, Body, Param } from "@nestjs/common";
import { PasswordResetService } from "./passwordresetservices";
import { ParamDto } from "./dto/passwordreset.param.dto";
import { BodyDto } from "./dto/passwordreset.body.dto"

@Controller('auth')
export class PasswordResetTokenController{
    constructor(private readonly passwordReset: PasswordResetService){}

    @Post('forgot-password')
    forgotPassword(
        @Body() dto: BodyDto,
    ){
        try{
            return this.forgotPassword(dto);
        }catch(error){
            return 'Internal error';
        }
    }

    @Post('reset-password/:id')
    resetPassword(
        @Param() dto: ParamDto
    ){
        try{
            return this.resetPassword(dto);
        }catch(error){
            return 'Internal error';
        }
    }

}