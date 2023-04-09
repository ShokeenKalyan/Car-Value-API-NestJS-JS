import { 
    Body, 
    Controller, 
    Post, 
    Get, 
    Patch, 
    Delete, 
    Param, 
    Query, 
    NotFoundException, 
    UseInterceptors, 
    ClassSerializerInterceptor, 
    Session,
    UseGuards // We can apply guards using UseGuards to restrict access to either the entire application, a specific controller or specific handlers
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
//import { SerializeInterceptor } from 'src/interceptors/serialize.interceptor'; 
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { AuthGuard } from '../guards/auth.guard';


// @UseInterceptors(CurrentUserInterceptor) // Whenever a request comes in the controller, we pull out the userId from session and find the user from DB to put it on the request object
// However, this interceptor is controller scoped. If we use multiple controllers in our application, then copying the same interceptor insode every controller becomes tedious
// So we have to make our controller globally scoped 
@Controller('auth')
@Serialize(UserDto)
export class UsersController {
    constructor(
        private usersService: UsersService,
        private authService: AuthService
        ) {}
    
    /* Example routes */
    @Get('/colors/:color')
    setColor(@Param('color') color: string, @Session() session: any ) {
        session.color = color // updating our session object
    }

    @Get('/colors')
    getColor(@Session() session: any) {
        return session.color
    }
    /*  */
    
    /*
    @Get('/whoami')
    whoAmI(@Session() session: any) {
        return this.usersService.findOne(session.userId)
        // If a user is signed up in our application, then they have a defined user ID property inside the cookie
    }
    */

    @Get('/whoami')
    @UseGuards(AuthGuard) // If it returns false(user not signed in), they won't be able to access below route handler and get a response of 403
    whoAmI(@CurrentUser() user: User) {
        // CurrenUser is a custom decorator that pulls off the current user and gives it as a argument
        // If we don't want to make use of decorator, we can simply use interceptor and make use of @Req() decorator to extract currentUser from it
        return user
    }

    @Post('/signout')
    signOut(@Session() session: any) {
        session.userId = null
    }
    
    @Post('signup')
    async createUser(@Body() body: CreateUserDto, @Session() session: any) {
        
        const user = await this.authService.signup(body.email, body.password)
        session.userId = user.id
        return user
        // this.usersService.create(body.email, body.password)

        // Flow of above route
        // 1) POST request generted with body - { email: '' and password: '' }
        // 2) Set up a validation pipe to validate the incoming body data using CreateUserDto(email:string, password:string)
        // 3) Body is then sent to UsersController which defines routes and picks up relevant data from incoming requests
        // 4) This data/information is sent as input for business logic in UsersService
        // 5) We then take this email and password and turn it into an instance of User entity(which define what a user is)
        // 6) We then makes use of users repository to actually save this user into our DB
        // 7) This repository is created automatically by typeorm which is our interface to SQLote DB
    }

    @Post('signin')
    async signin(@Body() body: CreateUserDto, @Session() session: any) {
        const user = await this.authService.signin(body.email, body.password)
        session.userId = user.id
        // If there is no change in cookie, then session will not send back any updated cookie in response
        return user
    }

    // @UseInterceptors(ClassSerializerInterceptor) // This helps to intercept and manipulate outgoing response(Excluding password from body) whenever below route is executed
    // Nest recommended solution to remove password from body - First set Exclude() decorator on password in User instance and then use interceptor on controller to effect that chnge in response
    // But this approach does not work if there are 2 route handlers using the same user entity. For eg, if the route is admon/auth/:id, then we want to show the password as well
    // So with same user entity, we cannot implement different functionalities on 2 different routes
    // To solve this, we will use our own custom serializer interceptors called DTOs(Data Transfer Objects)
    // DTOs can be used not only for validating incoming data but also for outgoing response data
    // So basis our route handler, we can create different output DTOs to serialize our response
    // @UseInterceptors(new SerializeInterceptor(UserDto))
    // @Serialize(UserDto)
    @Get('/:id')
    async findUser(@Param('id') id: string) {
        // console.log('Handler is running')
        // Though id is a number, every part of the URL is a string, so ID here is of string type
        const user = await this.usersService.findOne(parseInt(id))
        if (!user) {
            throw new NotFoundException('user not found')
        }
        return user
    }

    @Get()
    findAllUsers(@Query('email') email: string) {
        return this.usersService.find(email)
    }

    @Delete('/:id')
    removeUser(@Param('id') id: string) {
        return this.usersService.remove(parseInt(id))
    }

    @Patch('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.usersService.update(parseInt(id), body)
    }

    // INTERCEPTORS-
    // Interceptors can mess around with incoming requests and/or outgoing responses - Similar to middlewares in other frameworks
    // We can apply interceptors to either individual route handlers or entire controllers
    
}
