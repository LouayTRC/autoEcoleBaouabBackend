import { Injectable } from "@nestjs/common";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";

@Injectable()
export class FileUploadService {

    async saveFile(file: Express.Multer.File, folder: string): Promise<string> {
        const folderPath = join(process.cwd(), "uploads", folder);
        await mkdir(folderPath, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileExt = extname(file.originalname);
        const fileName = `${file.originalname.split('.')[0]}-${timestamp}${fileExt}`;

        const filePath = join(folderPath, fileName);

        await writeFile(filePath, file.buffer);


        return `${folder}/${fileName}`;
    }
}