import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreatePagosDto {
    @ApiProperty({
        example: 1,
        description: 'ID de la reserva',
    })
    @IsNotEmpty({ message: 'El ID de la reserva es obligatorio' })
    id_reserva!: number;

    @ApiProperty({
        example: 1,
        description: 'ID del cupón',
    })
    @IsOptional()
    id_cupon: number;

    @ApiProperty({
        example: 100,
        description: 'Monto del pago',
    })
    @IsNotEmpty({ message: 'El monto del pago es obligatorio' })
    monto_original!: number;

    @ApiProperty({
        example: 100,
        description: 'Monto del descuento',
    })
    @IsNotEmpty({ message: 'El monto del descuento es obligatorio' })
    monto_descuento!: number;

    @ApiProperty({
        example: 100,
        description: 'Monto final',
    })
    @IsNotEmpty({ message: 'El monto final es obligatorio' })
    monto_final!: number;

    @ApiProperty({
        example: 'TARJETA',
        description: 'Metodo de pago',
    })
    @IsNotEmpty({ message: 'El metodo de pago es obligatorio' })
    @IsString({ message: 'El metodo de pago debe ser una cadena de texto' })
    @MaxLength(20, { message: 'El metodo de pago no puede exceder los 20 caracteres' })
    metodo!: string;

    @ApiProperty({
        example: 'PENDIENTE',
        description: 'Estado del pago',
    })
    @IsNotEmpty({ message: 'El estado del pago es obligatorio' })
    @IsString({ message: 'El estado del pago debe ser una cadena de texto' })
    @MaxLength(20, { message: 'El estado del pago no puede exceder los 20 caracteres' })
    estado!: string;

    @ApiProperty({
        example: 'PENDIENTE',
        description: 'Referencia externa del pago',
    })
    @IsOptional()
    @IsString({ message: 'La referencia externa del pago debe ser una cadena de texto' })
    @MaxLength(255, { message: 'La referencia externa del pago no puede exceder los 255 caracteres' })
    referencia_externa?: string;
}