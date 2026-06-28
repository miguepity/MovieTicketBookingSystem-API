import { ApiProperty } from '@nestjs/swagger';

export class PosterUploadResponseDto {
  @ApiProperty({ type: String, example: '1' })
  id!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/poster.jpg', nullable: true, required: false })
  poster_url!: string | null;
}
