import { CineController } from "./cines.controller";
import { CineService } from "./cines.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [CineController],
    providers: [CineService]
})

export class CineModule{}