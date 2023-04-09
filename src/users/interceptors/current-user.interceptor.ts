import {
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Injectable
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { UsersService } from '../users.service'

// Creating a custome Interceptor that is going to give us the current user
// We cannot use DI system(Controller, Service, Repository) directly inside our CurrentUser() Decorator
// So we make use of our custom Interceptor that is going to interact with our DI system to fetch the user from DB and give user details to our decorator @CurrentUser()
@Injectable() // To make use of our DI system
export class CurrentUserInterceptor implements NestInterceptor {
    constructor(private usersService: UsersService) {}

    async intercept(context: ExecutionContext, handler: CallHandler<any>) {
        const request = context.switchToHttp().getRequest()
        const { userId } = request.session || {}
        
        if ( userId ) {
            const user = await this.usersService.findOne(userId)
            request.currentUser = user // Put the current user on request as a property
        }
        return handler.handle()
    }
}