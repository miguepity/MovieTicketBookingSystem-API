import { IsNumber, IsNotEmpty } from "class-validator";

export class ParamDto{
    @IsNumber()
    @IsNotEmpty()
    id!: number
}