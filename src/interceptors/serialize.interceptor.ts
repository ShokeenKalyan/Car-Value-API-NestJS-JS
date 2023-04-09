import {
    UseInterceptors,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { plainToClass } from 'class-transformer'

interface ClassConstructor {
    new (...args: any[]): {}
} // This interface says that as long as a Class type is given to it, it will be accepted

// Exporting a custom decorator - a decorator is simply a plain function
export function Serialize(dto: ClassConstructor) {
    return UseInterceptors(new SerializeInterceptor(dto))
}

export class SerializeInterceptor implements NestInterceptor {
    // implements is used when we want to make our class satisfies all requirements of either an abstract class or an interface
    // In contrast, we use extends whenever we are subclassing an existing class

    constructor(private dto: any) {}

    intercept(context: ExecutionContext, handler: CallHandler): Observable<any>{
        // Run something before a request is handled by the request handler
        // console.log('I am running before the handler', context)

        return handler.handle().pipe(
            map((data: any) => {
                // Run something before the response is sent out
                // console.log('I am running before response is sent out', data)
                return plainToClass(this.dto, data, {
                    excludeExtraneousValues: true // It ensures that only those fields are included in response that are specifically marked with Expose Decorator
                }) // this will convert our response data into an instance of UserDto 
            })
        )
    }
}