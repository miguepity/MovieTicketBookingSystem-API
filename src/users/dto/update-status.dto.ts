import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export class UpdateStatusDto {
  @ApiProperty({
    example: 'inactive',
    description: 'Nuevo estado del usuario',
    enum: UserStatus,
  })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  estado: string;
}
