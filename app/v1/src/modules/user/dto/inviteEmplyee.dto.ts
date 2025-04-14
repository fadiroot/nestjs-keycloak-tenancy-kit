import { IsString, IsEmail, IsOptional, IsDate, Length, Matches, IsEnum, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
}

export enum EmploymentStatus {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  TEMPORARY = 'temporary',
  CONTRACT = 'contract',
  INTERN = 'intern',
}
export enum PerType {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}
export enum paySchedule {
  EVERY_OTHER_WEEK = 'every other week',
  TWICE_MONTH = 'twice a month'
}
export enum payType {
  SALARY = 'salary',
  HOURLY = 'hourly',
  COMMISION = 'commission'
}



export class InviteEmployeeDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Optional employee profile picture'
  })
  @IsOptional()
  file?: Express.Multer.File;
  @ApiProperty({
    description: 'Organization ID in UUID format',
    example: 'e583388f-f2e0-465f-9056-19feaf025a58'
  })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({
    description: "Email address of the invited user",
    example: "employee@gmail.com"
  })
  @Length(3, 255)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "country of invited user",
    example: "tunis",
  })
  @Length(2, 255)
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: "Username of the invited user",
    example: "john"
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  username: string;

  @ApiProperty({
    description: "First name of the invited user",
    example: "John"
  })
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({
    description: "Last name of the invited user",
    example: "Doe"
  })
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiProperty({
    description: "Gender of the invited user",
    example: "male",
    enum: Gender
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: "Social security number in the format of numbers and hyphens only",
    example: "123-45-6789"
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9-]+$/, {
    message: 'Social security number must contain only numbers and hyphens'
  })
  socialSecurityNumber?: string;

  @ApiProperty({
    description: "Mobile phone number of the invited user (optional)",
    example: "+1234567890",
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s-]+$/, {
    message: 'Mobile phone number must be a valid phone number'
  })
  mobilePhoneNumber?: string;

  @ApiProperty({
    description: "Work phone number of the invited user (optional)",
    example: "+0987654321",
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s-]+$/, {
    message: 'Work phone number must be a valid phone number'
  })
  workPhoneNumber?: string;

  @ApiProperty({
    description: "Birthday of the invited user in date format (optional)",
    example: "1990-01-01",
    required: false
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birthday?: Date;

  @ApiProperty({
    description: "Marital status of the invited user",
    example: "single",
    enum: MaritalStatus
  })
  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @ApiProperty({
    description: "Hire date of the invited user in date format (optional)",
    example: "2023-11-01",
    required: false
  })

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  hireDate?: Date;

  @ApiProperty({
    description: "Employment status of the invited user (optional)",
    example: "full-time",
    required: false
  })
  @IsNotEmpty()
  @IsEnum(EmploymentStatus)
  employmentStatus?: string;


  @ApiProperty({
    description: "home Email of the invited user (optional)",
    example: "mazen@gmail.com",
    required: false
  })
  @IsOptional()
  @IsEmail()
  homeEmail?: string;


  @ApiProperty({
    description: "Location ID associated with the invited user (optional)",
    example: "loc123",
    required: false,
    nullable: true,

  })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiProperty({
    description: "User role ID associated with the invited user (optional)",
    example: "5b40df7b-0110-4830-8feb-ed258923b2ac",
    required: false
  })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiProperty({
    description: "Department ID associated with the invited user (optional)",
    example: "8c2728c0-68a0-4d69-8912-a821eeff029b	",
    required: false
  })
  @IsNotEmpty()
  @IsString()
  departmentId?: string;

  @ApiProperty({
    description: "Street name of the invited user (optional)",
    example: "123 Main St",
    required: false
  })
  @IsOptional()
  @IsString()
  streetName?: string;

  @ApiProperty({
    description: "State of the invited user (optional)",
    example: "California",
    required: false
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: "Zip code of the invited user (optional)",
    example: "90210",
    required: false
  })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiProperty({
    description: "Pay type of the invited user (optional)",
    example: "hour",
    enum: PerType
  })
  @IsOptional()
  @IsEnum(PerType)
  perType?: PerType;

  @ApiProperty({
    description: "Pay schedule of the invited user (optional)",
    example: "every other week",
    enum: paySchedule
  })
  @IsOptional()
  @IsEnum(paySchedule)
  paySchedule?: string;

  @ApiProperty({
    description: "Pay rate of the invited user (optional)",
    example: 1450,
  })
  @IsOptional()
  @IsNumber()
  payRate?: number;

  @ApiProperty({
    description: "Pay type of the invited user (optional)",
    example: "salary",
    enum: payType
  })
  @IsOptional()
  @IsEnum(payType)

  payType?: string;

  @ApiProperty({
    description: "image url (optional)",
    example: "url image",
  })
  @IsString()
  @IsOptional()
  imgUrl?: string

  @ApiProperty({
    description: "Job title of the invited user (optional)",
    example: "backend",
  })
  @IsString()
  @IsOptional()
  jobTitle?: string






}

