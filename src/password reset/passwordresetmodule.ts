import { Module } from "@nestjs/common";
import { PasswordResetService } from "./passwordresetservices";
import { PasswordResetTokenController } from "./passwordresetcontroller";

@Module({
    controllers: [PasswordResetTokenController],
    providers: [PasswordResetService]
})

export class PasswordResetTokenModule{}