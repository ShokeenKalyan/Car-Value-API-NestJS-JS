import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        // Defining dependencies of user service
        @InjectRepository(User) // This tells the Dependency Injection System that we need the User Repository
        // We do this way because we have to use a generic type of repository here(User)
        private repo: Repository<User> // We use private to abbreviate property definition and assignment
        // We applied type annotation of Repository of generic type User - This means that this repository is going to handle users
    ) {}

    create(email:string, password:string) {
       // We need to take in email and password and use them with repository to create and save a new user in the DB 
        
       const user = this.repo.create({ email, password })
       
       return this.repo.save(user)
       // create method does not persist any info inside our DB, instead it takes in some info, creates a new instance of user entity and assigns the email and password to that entity
       // save method is used to actually persist the instance of our user entity to the DB

       // this.repo.save({ email, password })
       // We could directly pass email and password into save method but we would always want to first create and then save the user

       // If we save data using instance of user entity, then all typeorms hooks(AfterInsert, AfterUpdate, AfterRemove) will be executed
       // If we save directly the email and password, the typeorms hooks will not be executed

       // save and remove methods are expected to be called with entity instances which makes the hooks exexutable
       // insert, update or delete methods directly play with data w/o using entities. So, hooks are not executed

    }

    findOne(id: number) {
        if (!id) {
            return null
        } // we have to do this since findOne(null) still returns the first user in our sqlite db table
        return this.repo.findOneBy({id}) // returns only one record
    }

    find(email: string) {
        return this.repo.find({where: {email}}) // find returns array of records
    }

    async update(id: number, attrs: Partial<User>) {
        // Partial here is a type helper that tells that attrs(attributes) can be any object that has at least some or none of the properties of the User entity
        // So arguments like {email: 'abc'}, {password: 'qwe123'} or {email: 'zxc', password: 'iop456'} are all valid attributes for update method
        
        // In general, we want to use save and remove methods wherever possible since they can work with instances(and not just plain objects) and helps to perform some operations using typeorm hooks
        // flow with save method looks like this - findOne(1) -> update({email: 'abcd'}) -> save()
        // However this approach is inefficient since it requires 2 trips to the DB(findOne and save)
        // If we use update method directly, then that would involve only 1 trip to the DB - More efficient

        // We would be using former approach
        const user = await this.findOne(id)
        if (!user) {
            //throw new Error('user not found') // We don't use Error simply sicne it does not give information about the error object
            // So we make use of custom error handlers provided by the Nest itself
            // Note- Exceptions can be handled only on HTTP requests and not so easily on WebSocket or GRPC protocols
            throw new NotFoundException('user not found')
        }
        Object.assign(user, attrs) // Object.assign is a built-in function that takes all values of properties in attrs and copy them directly over to user
        return this.repo.save(user)
    }

    async remove(id: number) {
        // remove method is designed to work with entity - remove(Entity)
        // delete method is designed to work with just a plain ID or some kind of search criteria - delete(id) or delete({email: 'abc@dfg'})

        // delete method just takes 1 trip to the DB -> Quick but associated hooks(@AfterRemove() logRemove() {}) will not be executed
        // remove method would make use of 2 trips to the DB - find and remove - inefficient but lets make use of hooks

        const user = await this.findOne(id)
        if (!user) {
            throw new NotFoundException('user not found!')
        }
        return this.repo.remove(user)
    }
    
}
