import {
    createParamDecorator,
    ExecutionContext
} from '@nestjs/common'

// Creating a custom param decorator
export const CurrentUser = createParamDecorator(
    (data: never, context: ExecutionContext) => {
        // ExecutionContext is a wrapper around the incoming request
        // Is not only gives access to http request, but also websocket incoming message, a GEPC request etc
        // return 'hi there'
        // Whatever we return from here, it will be available as an argument in @CurrentUser() decorator in our route handler
        // data here is the number/string/object that we provide inside our decorator. Eg- @CurrentUser('abc'), @CurrentUser(123) etc
        // In our case, we won't be using data, so we update its type from 'any' to 'never'

        const request = context.switchToHttp().getRequest() // This gives us the underlying request coming into our application
        //console.log(request.session.userId)
        //return 'hi there'
        return request.currentUser // currentUser is available on request because of current-user.interceptor
    }
)