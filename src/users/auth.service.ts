import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto"; // randomBytes is to generate salt and scrypt is the hashing function
// scrypt make use of traditional callbacks instead of promises. So, we have to wrap it up so as to promisify it
// For this, we will use promisify method in util library
import { promisify } from "util";

const scrypt = promisify(_scrypt) // We use underscore so that we can use scrypt keyword for our variable

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    // Common Auth System features -
    // 1) Handler to Sign up(Create) a new user (/signup)
    // 2) Handler to Sign in an existing user (/signin)
    // 3) Handler to Sign out an existing user (/signout)
    // 4) Handler to return a currently signed in user (/whoami)
    // 5) Reject requests to certain handlers if the user is not signed in (Using AuthGuards)
    // 6) Automatically tell a handler who the currently signed in user is (Using Custom Decorator and Interceptor)
    
    
    async signup(email: string, password: string) {
        // 1) See if email is already in use
        const users = await this.usersService.find(email)
        if ( users.length ) {
            throw new BadRequestException('email already in use')
        }

        // 2) Hash the user's password

            // Hashing is necessary since we don't want the original password to be persisted as it is in the DB
            // Goal of a hashing function is to calculate a hash based on I/P and give back a string of nos & letters
            // Very small changes in same input results in a complete different hash
            // Hashing process can't be undone/reversed to figure out the I/P (mypass -> 5ty76dvf6, 5ty76dvf6 -> hg512bvas)
            // When a user signs in, his/her password is hashed again and then compared to the one in DB against that particular email to check if the credentials are valid or not
            // Rainbow Table attack - A malicious user can have a list of all popular passwords in the world like- password, mypassword, qwerty, iloveyou etc
                // This user can then generate hashes of all these millions of common passwords and store it somewhere ahead of time
                // Now, if this user got access to our DB somehow, then he/she coul simply match all passwords with his stored hash table
                // If a match is found, then that user can use the email from the DB and unshashed password to login maliciously
            // To prevent this, we make use of something called salt
            // Salt is a random series of numbers and letters which we are going to generate at signup. For eg- a10h7u5
            // We then join user password and salt into a one single string. Eg - mypassworda10h7u5
            // This joint string is then passed to the hashing function which generates a O/P string. For eg- aah7dgg254ibd
            // Now we join back this O/P with salt separated by .,/ etc. For eg- aah7dgg254ibd.a10h7u5. This is called Hashed & Salted password
            // This H&S password is thenfinally stored in the DB
            // Now during signin, we take a look at the user's email address and find his H&S password in the DB
            // We separate this password string after period(.) as hash(aah7dgg254ibd) and salt(a10h7u5)
            // Now using this salt, we again join it with the signin password and generate a hashed password for it (aah7dgg254ibd)
            // If this hashed password is similar to the hash we generated earlier, then the user's credentials are valid
            // Now if someone wants to generate a rainbow table, then they have to generate hashes for all passwords with all possible salts(which is basically a random string of numbers & letters)

        // 2A) Generate a Salt
        const salt = randomBytes(8).toString('hex')
        // randomBytes returns a Buffer(similar to array) which stores some binary data
        // We convert this random binary sequence to a string using toString
        // Every 1 byte converts to 2 characters when converted to hex. So salt is a 16 character long string 

        // 2B) Hash the salt and password together
        const hash = (await scrypt(password, salt, 32)) as Buffer // 32 would be the hash string length
        // To help typescript understand what a hash is, we use as Buffer

        // 2C) Join the hashed result and the salt together
        const result = salt + '.' + hash.toString('hex')


        // 3) Create a new user and save it
        const user = await this.usersService.create(email, result)

        // 4) Return the user
        return user
    }

    async signin(email: string, password: string) {
        const [user] = await this.usersService.find(email) // using array destructuring since find method returns an array and we only want the one(first) result
        if (!user) {
            throw new NotFoundException('User not found!')
        }

        const [salt, storedHash] = user.password.split('.')
        const hash = (await scrypt(password, salt, 32)) as Buffer

        if ( storedHash !== hash.toString('hex') ) {
            throw new BadRequestException('Bad Password')  
        }
        
        // Cookie session
            // Cookie-sesion library looks at the 'Cookie' header in a request. Eg, Cookie - ey67bdgc6b490xb
            // Cookie-session decodes the string, resulting in an object. Eg { color: 'red' }
            // We get access to session object in request handler using a decorator
            // We add/remove/change properties on the session object. Eg { color: 'blue' }
            // Cookie-Session sees the updated session and turns it into an encrypted string
            // This string is sent back in the 'Set-cookie' header on the response object. Eg, Set-Cookie - rtd8h78nbc64k

            // So, we can take some information stored inside the cookie and then retrieve that information on a later follow up request
            // Using session , we can store information between different requests 

        
        return user
    }
}