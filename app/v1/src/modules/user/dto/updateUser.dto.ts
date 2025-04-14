import { 
  IsString, 
  IsEmail, 
  IsBoolean, 
  IsOptional, 
  IsDate, 
  IsNumber,
  IsEnum, 
  IsUUID,
  ValidateNested,
  IsUrl
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  Gender, 
  EmploymentStatus, 
  MaritalStatus, 
  paySchedule, 
  PerType, 
  payType 
} from './inviteEmplyee.dto';

export enum ShirtSize {
  XXS = 'XXS',
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL'
}

export enum DietaryRestrictions {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  NUT_FREE = 'nut_free',
  DAIRY_FREE = 'dairy_free',
  HALAL = 'halal',
  KOSHER = 'kosher',
  PESCATARIAN = 'pescatarian',
  LOW_CARB = 'low_carb',
  LOW_SODIUM = 'low_sodium',
  OTHER = 'other',
}
export enum Allergies {
  PEANUTS = 'peanuts',
  TREE_NUTS = 'tree_nuts',
  SHELLFISH = 'shellfish',
  FISH = 'fish',
  DAIRY = 'dairy',
  EGGS = 'eggs',
  WHEAT = 'wheat',
  SOY = 'soy',
  SESAME = 'sesame',
  GLUTEN = 'gluten',
  OTHER = 'other'
}
export enum EducationDegree {
  HIGH_SCHOOL = 'high_school',
  ASSOCIATE_DEGREE = 'associate_degree',
  BACHELOR_DEGREE = 'bachelor_degree',
  MASTER_DEGREE = 'master_degree',
  DOCTORAL_DEGREE = 'doctoral_degree',
  PROFESSIONAL_DEGREE = 'professional_degree',
  CERTIFICATE = 'certificate'
}


export enum VisaType {
  WORK_VISA = 'work_visa',
  STUDENT_VISA = 'student_visa',
  TOURIST_VISA = 'tourist_visa',
  BUSINESS_VISA = 'business_visa',
  TRANSIT_VISA = 'transit_visa',
  PERMANENT_RESIDENCE = 'permanent_residence',
  TEMPORARY_RESIDENCE = 'temporary_residence',
  DIPLOMATIC_VISA = 'diplomatic_visa',
  OFFICIAL_VISA = 'official_visa',
  FAMILY_REUNION_VISA = 'family_reunion_visa',
  INVESTOR_VISA = 'investor_visa',
  SKILLED_WORKER_VISA = 'skilled_worker_visa',
  STARTUP_VISA = 'startup_visa',
  RESEARCH_VISA = 'research_visa'
}

export enum VisaStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  IN_PROCESS = 'in_process',
  UNDER_REVIEW = 'under_review',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export enum Relationship {
  BROTHER = 'brother',
  SISTER = 'sister',
  FATHER = 'father',
  MOTHER = 'mother',
  SON = 'son',
  DAUGHTER = 'daughter',
  SPOUSE = 'spouse',
  PARTNER = 'partner',
  OTHER = 'other'
}


export class UpdateUserDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Optional employee profile picture'
  })
  @IsOptional()
  file?: Express.Multer.File;
  @ApiPropertyOptional({ description: 'Username' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ description: 'User first name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'User email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Home email address' })
  @IsEmail()
  @IsOptional()
  homeEmail?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Hire date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  hireDate?: Date;

  @ApiPropertyOptional({ description: 'Mobile phone number' })
  @IsString()
  @IsOptional()
  mobilePhoneNumber?: string;

  @ApiPropertyOptional({ description: 'Work phone number' })
  @IsString()
  @IsOptional()
  workPhoneNumber?: string;

  @ApiPropertyOptional({ description: 'Birthday' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthday?: Date;

  @ApiPropertyOptional({ description: 'Employment status', enum: EmploymentStatus })
  @IsEnum(EmploymentStatus)
  @IsOptional()
  employmentStatus?: EmploymentStatus;

  @ApiPropertyOptional({ description: 'Location ID' })
  @IsString()
  @IsOptional()
  locationId?: string;



  @ApiPropertyOptional({ description: 'Department ID' })
  @IsString()
  @IsOptional()
  departmentId?: string;
  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsString()
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Marital status', enum: MaritalStatus })
  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({ description: 'Street name' })
  @IsString()
  @IsOptional()
  streetName?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP code' })
  @IsString()
  @IsOptional()
  zip?: string;

  @ApiPropertyOptional({ description: 'Gender', enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Social security number' })
  @IsString()
  @IsOptional()
  socialSecurityNumber?: string;

  @ApiPropertyOptional({ description: 'Pay schedule', enum: paySchedule })
  @IsEnum(paySchedule)
  @IsOptional()
  paySchedule?: paySchedule;

  @ApiPropertyOptional({ description: 'Per type', enum: PerType })
  @IsEnum(PerType)
  @IsOptional()
  perType?: PerType;

  @ApiPropertyOptional({ description: 'Pay rate' })
  @IsNumber()
  @IsOptional()
  payRate?: number;

  @ApiPropertyOptional({ description: 'Pay type', enum: payType })
  @IsEnum(payType)
  @IsOptional()
  payType?: payType;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsString()
  @IsOptional()
  imgUrl?: string;

  
  @ApiPropertyOptional({ description: 'Job title ' })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Leave balance' })
  @IsNumber()
  @IsOptional()
  leaveBalance?: number;

  @ApiPropertyOptional({ description: 'Is first login' })
  @IsBoolean()
  @IsOptional()
  isFirstLogin?: boolean;


  @ApiPropertyOptional({ description: 'Shirt sizes', enum: ShirtSize, example: ShirtSize.XL })
  @IsEnum(ShirtSize)
  @IsOptional()
  shirtSizes?: ShirtSize;

  @ApiProperty({
    description: "User's allergies",
    type: [Allergies],
    enum: Allergies,
    example: [Allergies.PEANUTS, Allergies.DAIRY],
    required: false
  })
  @IsOptional()
  @IsEnum(Allergies, { each: true })
  allergies?: Allergies[];

  @ApiProperty({
    description: "User's dietary restrictions",
    type: [DietaryRestrictions],
    enum: DietaryRestrictions,
    example: [DietaryRestrictions.VEGETARIAN, DietaryRestrictions.VEGAN],
    required: false
  })
  @IsOptional()
  @IsEnum(DietaryRestrictions, { each: true })
  dietaryRestrictions?: DietaryRestrictions[];

  @ApiProperty({
    description: "User's education details",
    type: 'array',
    items: {
      type: 'object',
      properties: {
        institution: { type: 'string', example: 'Stanford University' },
        degree: { 
          type: 'string', 
          enum: Object.values(EducationDegree),
          example: EducationDegree.BACHELOR_DEGREE 
        },
        start_date: { type: 'string', format: 'date', example: '2012-09-01' },
        end_date: { type: 'string', format: 'date', example: '2016-06-30' }
      }
    },
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EducationEntry)
  education?: EducationEntry[];

  @ApiProperty({
    description: "User's visa details",
    type: 'array',
    items: {
      type: 'object',
      properties: {
        visa_type: { 
          type: 'string', 
          enum: Object.values(VisaType),
          example: VisaType.WORK_VISA 
        },
        status: { 
          type: 'string', 
          enum: Object.values(VisaStatus),
          example: VisaStatus.APPROVED 
        },
        issuing_country: { type: 'string', example: 'United States' },
        delivery_date: { type: 'string', format: 'date', example: '2023-01-15' },
        expiration_date: { type: 'string', format: 'date', example: '2025-01-15' },
        notes: { type: 'string', example: 'Additional visa information' }
      }
    },
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VisaEntry)
  visa?: VisaEntry[];

  @ApiProperty({
    description: "Emergency contact details",
    type: 'array',
    items: {
      type: 'object',
      properties: {
        relationship: { 
          type: 'string', 
          enum: Object.values(Relationship),
          example: Relationship.SPOUSE 
        },
        mobilePhone: { type: 'string', example: '+1-555-111-2222' },
        email: { type: 'string', format: 'email', example: 'jane.doe@example.com' },
        address: { type: 'string', example: '456 Oak Street, Los Angeles, CA 90001' }
      }
    },
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactEntry)
  emergencyContact?: EmergencyContactEntry[];

  @ApiProperty({
    description: "List of languages  for the user",
    type: [String],
    example: ['arabic', 'english'],
    required: false
  })
 


  @IsOptional()
  spokenLanguages?:string[]

  @ApiProperty({
    description: "User's social media links",
    type: 'array',
    items: {
      type: 'object',
      properties: {
        social_link_type_id: { type: 'string', format: 'uuid', example: 'd760e3a9-1941-4482-b161-8c239c894080' },
        link_url: { type: 'string', format: 'url', example: 'https://www.facebook.com/username' }
      }
    },
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkEntry)
  socialLinks?: SocialLinkEntry[];
 
}

class EducationEntry {
  @IsString()
  institution: string;

  @IsEnum(EducationDegree)
  degree: EducationDegree;

  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  end_date?: Date;
}

class VisaEntry {
  @IsEnum(VisaType)
  visa_type: VisaType;

  @IsEnum(VisaStatus)
  status: VisaStatus;

  @IsString()
  issuing_country: string;

  @IsDate()
  @Type(() => Date)
  delivery_date: Date;

  @IsDate()
  @Type(() => Date)
  expiration_date: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

class EmergencyContactEntry {


  @IsEnum(Relationship)
  relationship: Relationship;

  @IsString()
  mobilePhone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;



  
}

class SocialLinkEntry {
  @IsUUID()
  social_link_type_id: string;

  @IsString()
  @IsUrl()
  link_url: string;

}
