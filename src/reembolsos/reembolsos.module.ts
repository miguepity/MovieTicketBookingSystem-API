import { Module } from "@nestjs/common";
import { ReembolsosService } from "./reembolsos.services";
import { ReemolsosController } from "./reembolsos.controller";
@Module({
    controllers: [ReemolsosController],
    providers: [ReembolsosService]
})

export class ReembolsosModule{}