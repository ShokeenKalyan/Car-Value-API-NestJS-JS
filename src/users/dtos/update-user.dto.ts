import { IsEmail, IsString, IsOptional } from 'class-validator'

export class UpdateUserDto {
    // We can update either email either password or both email and password
    // So we will be marking our fields with IsOptional Decorator
    
    @IsEmail()
    @IsOptional()
    email: string

    @IsString()
    @IsOptional()
    password: string
}