import { AfterInsert, AfterRemove, AfterUpdate, Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Exclude } from 'class-transformer'
import { Report } from '../reports/report.entity'

@Entity() // This decorator tells typeorm to create a new table by name 'users' that model this class
export class User {
    @PrimaryGeneratedColumn() // Tells typeorm to take a look into 'users' and add a new column 'id' which is going o be automatically generated
    id: number

    @Column() // Create a column inside 'users' of type string(called varchar inside sql)
    email: string

    @Column()
    // Nest recommended solution to remove passwords from body - Not ideal for our scenario
    // @Exclude() // Whenever a instance of a user is turned into a plain object and then JSON, then password gets excluded
    password: string

    @Column({default: true})
    admin: boolean

    @OneToMany(() => Report, (report) => report.user) // First Argument says that our User is going to be associated with Report
    // We have to wrap Report inside  a function in the first argument because of circular dependency
    // When we log Report inside User entity and User inside Report entity, then we get undefined for User in Report Entity since Report entity is getting loaded up first
    // By the time User entity is loaded up, the Report entity is already defined
    // By wrapping the entities inside the callback function, our code gets loaded up and all the entities are defined befor going to the event loop
    // The 2nd argument allows us to go back to our source entity from the target entity (report -> user)
    reports: Report[]

    @AfterInsert()
    logInsert() {
        console.log('Inserted User with id ', this.id)
    }

    @AfterUpdate()
    logUpdate() {
        console.log('Updated User with id ', this.id)
    }

    @AfterRemove()
    logRemove() {
        console.log('Removed User with id ', this.id)
    }
}