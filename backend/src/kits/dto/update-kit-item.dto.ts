import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateKitItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  locationInKit?: string;

  @IsDateString()
  @IsOptional()
  expirationDate?: string | null;

  @IsString()
  @IsOptional()
  notes?: string;
}
