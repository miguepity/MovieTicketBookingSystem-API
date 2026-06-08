import { IsUrl } from 'class-validator';

export class UploadPosterDto {
  @IsUrl()
  posterUrl: string;
}
