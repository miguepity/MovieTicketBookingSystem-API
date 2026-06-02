import { ApiProperty } from '@nestjs/swagger';

export class CreateCiudadeDto {
  @ApiProperty()
  public nombre: string;

  constructor(nombre: string) {
    this.nombre = nombre;
  }
}
