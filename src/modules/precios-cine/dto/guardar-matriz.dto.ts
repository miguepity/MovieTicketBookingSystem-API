import { IsArray, IsObject, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CineMatrizItemDto {
  @IsOptional()
  @IsString()
  id_cine?: string;

  // Accept 'id' as alias for id_cine on round-trip from GET
  @IsOptional()
  @IsString()
  id?: string;

  // Read-only fields from GET shape — accepted and ignored on write
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsObject()
  precios: Record<string, number | null>;
}

export class GuardarMatrizDto {
  @IsOptional()
  @IsObject()
  defaults?: Record<string, number | null>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CineMatrizItemDto)
  cines?: CineMatrizItemDto[];

  // Accept and ignore tipos_asiento on round-trip from GET
  @IsOptional()
  @IsArray()
  tipos_asiento?: any[];
}
