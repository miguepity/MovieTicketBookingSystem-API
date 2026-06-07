import { Module } from '@nestjs/common';
import { PasswordResetService } from './passwordreset.service';
import { PasswordResetTokenController } from './passwordreset.controller';

@Module({
  controllers: [PasswordResetTokenController],
  providers: [PasswordResetService],
})
export class PasswordResetTokenModule {}
