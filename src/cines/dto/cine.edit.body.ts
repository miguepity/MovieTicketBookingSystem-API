import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class EditBodyDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    nombre?: string;

    @IsOptional()
    @IsString()
    direccion?: string;

    @IsOptional()
    @IsNumber()
    id_ciudad?: number;
}
