import { IsNotEmpty, IsNumber } from "class-validator";

export class PoliticaParamDto{
    @IsNumber({}, {message: 'must be a number'})
    @IsNotEmpty({message: 'must not be empty'})
    id!: number
}