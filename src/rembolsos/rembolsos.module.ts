import { Module } from "@nestjs/common";
import { RembolsosService } from "./rembolsos.services";
import { RemolsosController } from "./rembolsos.controller";
@Module({
    controllers: [RemolsosController],
    providers: [RembolsosService]
})

export class RembolsosModule{}