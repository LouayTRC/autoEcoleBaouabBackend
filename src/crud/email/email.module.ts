import { forwardRef, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from './email.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Email.name,schema:EmailSchema}]),
    forwardRef(()=>AuthModule)
  ],
  providers: [EmailService],
  controllers: [EmailController],
  exports:[EmailService]
})
export class EmailModule {}
