import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDate, IsIn, IsNotEmptyObject, IsNotEmpty } from 'class-validator';
import { ShirtSize, Allergies, DietaryRestrictions } from './updateUser.dto';

export class AddWelcomeKitDto {
  @ApiProperty({ 
    description: 'emil', 
    example: 'fadiromdhan@gmail.com',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'Hire Date Welcome', 
    example: '2023-06-15',
    required: false,
    type: Date
  })
  @IsOptional()
  @IsDate()
  hireDateWelcome?: Date | null;

  @ApiProperty({ 
    description: 'Arrival Time', 
    example: '09:00 AM',
    required: false
  })
  @IsOptional()
  @IsString()
  arriveTime?: string;

  @ApiProperty({ 
    description: 'Manager ID', 
    example: 'manager-uuid-456',
    required: false
  })
  @IsOptional()
  @IsString()
  manager?: string;

  @ApiProperty({ 
    description: 'Contact IDs', 
    example: ['contact-uuid-1', 'contact-uuid-2'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contacts?: string[];

  @ApiProperty({ 
    description: 'Other Special Instructions', 
    example: 'Provide ergonomic chair',
    required: false
  })
  @IsOptional()
  @IsString()
  otherInstructions?: string;
}


