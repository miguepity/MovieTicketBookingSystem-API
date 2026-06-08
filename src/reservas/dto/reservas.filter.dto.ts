import { IsOptional, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReservasFilterDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    id_pelicula!: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    id_cine!: number;

    @IsOptional()
    @IsDateString()
    fecha_inicio!: string;

    @IsOptional()
    @IsDateString()
    fecha_final!: string;

    @IsOptional()
    @IsString()
    estado!: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit: number = 10;
}