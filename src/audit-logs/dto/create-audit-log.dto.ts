import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'ID del usuario afectado', required: false })
  @IsOptional()
  @IsNumber()
  id_usuario?: number;

  @ApiProperty({ description: 'ID del auditor que realiza la acción' })
  @IsNotEmpty()
  @IsNumber()
  id_auditor: number;

  @ApiProperty({ description: 'Acción realizada' })
  @IsNotEmpty()
  @IsString()
  accion: string;

  @ApiProperty({ description: 'Detalles de la acción', required: false })
  @IsOptional()
  @IsString()
  detalle?: string;
}
