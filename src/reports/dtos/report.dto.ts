import { Expose, Transform } from 'class-transformer'
import { User } from '../../users/user.entity'

export class ReportDto {
    @Expose()
    id:number

    @Expose()
    price: number

    @Expose()
    year: number

    @Expose()
    lng: number

    @Expose()
    lat: number

    @Expose()
    make:string

    @Expose()
    model:string

    @Expose()
    mileage:number

    @Expose()
    approved: boolean

    // If we want to add a new property in the outgoing response, we can use Transform decorator
    @Transform(({obj})=> obj.user.id) // Pulling out user.id from the report instance object
    @Expose()
    userId:number
}