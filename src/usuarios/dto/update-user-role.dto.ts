import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({ example: 2, description: 'ID del rol a asignar' })
  @IsInt()
  rolId: number;
}
