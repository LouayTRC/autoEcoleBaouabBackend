import { Module } from "@nestjs/common";
import { FileUploadService } from "./fileUpload.service";



@Module({
  imports: [],
  providers: [FileUploadService],
  exports:[FileUploadService]
})
export class FileUploadModule {}
