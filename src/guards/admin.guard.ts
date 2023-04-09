import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()
        if (!request.currentUser) {
            return false
        }
        
        return request.currentUser.admin
    }
}

// Order of placing Middlewares, Guards and Interceptors is important in Nest
// If the CurrentUser Interceptor is running after AdminGuard, then request will never contain user.admin property
// And thus, it will always return false thereby forbidding to patch reports on approved property
// So, we need to turn CurrentUser Interceptor to CurrentUser middleware so that it always runs before the Guards (AdminGuard)
// In Nest, Interceptors always runs after Middlewares and Guards. So Middlewares and Guards cannot rely upon info that is created/assigned to request object inside of interceptor
// So, we need to make CurrentUser a global middleware inside app.module

// New order of execution would be-
// Cookie-Session Middleware -> CurrentUser Middleware -> Admin Guard -> Request Handler -> Response