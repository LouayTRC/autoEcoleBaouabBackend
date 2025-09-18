import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from './email.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Email.name,schema:EmailSchema}])
  ],
  providers: [EmailService],
  controllers: [EmailController],
  exports:[EmailService]
})
export class EmailModule {}
