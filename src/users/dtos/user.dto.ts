import { Expose } from 'class-transformer'

export class UserDto {
    @Expose() // It tells nest to include this field in the response output
    id: number

    @Expose()
    email: string
}