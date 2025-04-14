import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDate, IsIn, IsNotEmpty } from 'class-validator';
import { ShirtSize, Allergies, DietaryRestrictions } from './updateUser.dto';



export class AddUserExtraInformationDto   {
  @ApiProperty({ 
    description: 'id', 
    example: 'ccfd909e-3539-403c-8437-7d97181df13e',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;
  @ApiProperty({ 
    description: 'Shirt Size', 
    example: 'M',
    required: false,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  })
  @IsOptional()
  @IsIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
  shirt_size?: ShirtSize;

  @ApiProperty({ 
    description: 'User Allergies', 
    example: ['nuts', 'dairy'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  allergies?: Allergies[];

  @ApiProperty({ 
    description: 'Dietary Restrictions', 
    example: ['vegetarian'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  dietary_restrictions?: DietaryRestrictions[];

  @ApiProperty({ 
    description: 'Spoken Languages', 
    example: ['english', 'spanish'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  spoken_languages?: string[];
}