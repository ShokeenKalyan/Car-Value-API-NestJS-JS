import { Test } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { User } from './user.entity'
import { UsersService } from './users.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'

// Applying a description to the test inside
describe('AuthService', () => {
    let service: AuthService
    let fakeUsersService: Partial<UsersService>

    beforeEach(async () => {
        // Creating a fake copy of the users service
        const users: User[] = []
        fakeUsersService = {
            // Re-implementing find and create in a simple basic way that causes our original methods(signup & signin) to do something custom in our testing env
            // find: () => Promise.resolve([]), // similar to - const arr = await fakeUsersService.find()
            // create: () => Promise.resolve({id:1, email, password} as User)

            // Re-implementing find and create methods in a liitle more advanced way rather than returning simple responses
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email)
                return Promise.resolve(filteredUsers)
            },
            create: (email: string, password: string) => {
                const user = { id: Math.floor(Math.random()*9999) , email, password } as User
                users.push(user)
                return Promise.resolve(user)
            } 
            
            // We are only defining find and create methods becoz only these are actually made use of by the authentication service(signup() & signin())
        }
        
        
        // creating a testing DI container
        const module = await Test.createTestingModule({
            providers: [
                AuthService, // BAU, DI will uunderstand that one of the dependencies of this class is Users Service
                {
                    provide: UsersService, 
                    useValue: fakeUsersService // This tells DI that if someone asks for Users Service, then give them the value fake Users service 
                } // This tells how to resolve UsersService whenever we ask for a copy of Auth Service
            ]
        }).compile()

        service = module.get(AuthService) // This causes the DI container to create a new instance of AuthService with all of its dependencies already initialized
    })

    // Writing a test block
    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined() // Making sure to define the service inside our test
    })

    // Testing on salted and hashed password
    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('example@test.com', 'qwerty')

        // Making sure the password was salted and hashed in some way
        expect(user.password).not.toEqual('qwerty')
        const [salt, hash] = user.password.split('.')
        expect(salt).toBeDefined()
        expect(hash).toBeDefined()
    })

    /*
    it('throws an error if user signs up with email that is in use', async () => {
        // We are creating a different find method for this test since we would want find method here to return a non-empty array so that the result is an error(email already in use)
        // Rest all test blocks will use find method(resolved as empty array) that is defined in beforeEach block
        fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]); // We use 'as User' to tell TypeScript that to trust that this is a user entity(W/o loginsert, logupdate and logremove methods)
        await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
            BadRequestException,
        );
    });

    it('throws if signin is called with an unused email', async () => {
        await expect(
          service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
        ).rejects.toThrow(NotFoundException);
    });

    it('throws if an invalid password is provided', async () => {
        fakeUsersService.find = () =>
          Promise.resolve([
            { email: 'asdf@asdf.com', password: 'laskdjf' } as User,
          ]);
        await expect(
          service.signin('laskdjf@alskdfj.com', 'passowrd'), // This does not matter becoz we are always resolving find with above user details
        ).rejects.toThrow(BadRequestException);
      });
      */

      it('throws an error if user signs up with email that is in use', async () => {
        await service.signup('asdf@asdf.com', 'asdf');
        await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
          BadRequestException,
        );
      });
     
      it('throws if signin is called with an unused email', async () => {
        await expect(
          service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
        ).rejects.toThrow(NotFoundException);
      });
     
      it('throws if an invalid password is provided', async () => {
        await service.signup('laskdjf@alskdfj.com', 'password');
        await expect(
          service.signin('laskdjf@alskdfj.com', 'laksdlfkj'),
        ).rejects.toThrow(BadRequestException);
      });

      it('returns a user if correct password is provided', async() => {
          await service.signup('asdf@asdf.com', 'mypassword')

          const user = await service.signin('asdf@asdf.com', 'mypassword')
          expect(user).toBeDefined()
      })
    
})

