import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class EditBodyDto {
    @ApiPropertyOptional({ example: 'MovieTicket Centro' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    nombre?: string;

    @ApiPropertyOptional({ example: 'Calle Principal #1' })
    @IsOptional()
    @IsString()
    direccion?: string;

    @ApiPropertyOptional({ example: 2 })
    @IsOptional()
    @IsNumber()
    id_ciudad?: number;
}
