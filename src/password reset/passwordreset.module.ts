import { Module } from '@nestjs/common';
import { PasswordResetService } from './passwordreset.service';
import { PasswordResetTokenController } from './passwordreset.controller';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [PasswordResetTokenController],
  providers: [PasswordResetService],
})
export class PasswordResetTokenModule {}
