import {
    CanActivate,
    ExecutionContext
} from '@nestjs/common'

export class AuthGuard implements CanActivate {

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()
        
        return request.session.userId // If userId exists, then it is a truthy value (Means the user is signed in)
        // If userId is undefined, null, "" etc, then it is a falsy value and thus it shows that user is not logged-in
    }

}