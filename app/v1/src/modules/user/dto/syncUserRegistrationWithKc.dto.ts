import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SyncUserRegistrationWithKcdto {
    @IsString()
    @IsNotEmpty()
    id: string ;
    @IsString()
    @IsNotEmpty()
    username: string ;
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    firstName: string;
    @IsString()
    lastName: string;
    
}