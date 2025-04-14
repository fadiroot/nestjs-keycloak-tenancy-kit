import { IsOptional, IsInt, IsString, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryParams {
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  @IsInt()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        throw new Error('Invalid filter format');
      }
    }
    return value;
  })
  @IsObject()
  filter?: Record<string, string>;

  @IsOptional()
  country?: string;
}
