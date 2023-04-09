import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // This line creates the repository for user
  controllers: [UsersController],
  providers: [
    UsersService, 
    AuthService, 
    /*
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor // Seeting up a globally scoped interceptor
      // This gives us the benefit of not importing the interceptor in evry controller and provide CurrentUser on every route
      // One downside is of when a one or few controllers don't require current user on therir routes and still we are processing and giving them a user
    }
    */
  ]
})
export class UsersModule {
  // Defining a middleware that runs on all routes of users and which puts the Curren User on request object
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*')
  }
}
