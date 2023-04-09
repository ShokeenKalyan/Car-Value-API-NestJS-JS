import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from '../users/user.entity'

@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: false })
    approved: boolean

    @Column()
    price: number

    @Column()
    make: string

    @Column()
    model: string

    @Column()
    year: number

    @Column()
    lng: number

    @Column()
    lat: number

    @Column()
    mileage: number

    @ManyToOne(() => User, (user) => user.reports)
    user: User
}

// Associations with NestJS and TypeORM :
// 3 kind of associations in SQL databases -
//  1) One-To-One relationships - Country - Capital, Passport - Person
//  2) One-To-Many / Many-To-One - Customer - Orders, Country - Cities
//  3) May-To-Many - Trains - riders, Movie - Genre, Classes - Students
// In our application, we have One-To-Many / Many-To-One associations
// A user can have multiple reports and many reports can have One user

// ManyToOne causes a change in the DB, but OneToMany does not cause a change in the DB
// On the report table, TypeORM adds a new column to it automatically called user_id

// OneToMany does not change the Users table
// Reports tied to a user will be accessed with - user.reports
// Association is not automatically fetched when we fetch a user from our DB

// ManyToOne changes the reports Table
// User who created the report will be accessed with report.user
// Association is not automatically fetched when we fetch a Report from our DB

