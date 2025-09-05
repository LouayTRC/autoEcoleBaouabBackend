import { SetMetadata } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export const RolesDecorator = (...roles: string[]) => SetMetadata('roles', roles);


export function ImageUpload(fieldName: string) {
  return FileInterceptor(fieldName, {
    storage: memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Seules les images sont autorisées!'), false);
      }
      callback(null, true);
    },
  });
}
