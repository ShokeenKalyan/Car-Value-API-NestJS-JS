import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';
import { Report } from './reports/report.entity';
const cookieSession = require('cookie-session')

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Config Module to be used throughout our application - No need to reimport the config module into other modules
      envFilePath: `.env.${process.env.NODE_ENV}`
    }),
    TypeOrmModule.forRoot(), // Instead of defining DB connections here, we would be making use of ormconfig.js file to load DB connections in dev, testing as well as typeorm cli to run migrations
    /*
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'sqlite',
          database: config.get<string>('DB_NAME'),
          synchronize: true,
          entities: [User, Report]
        }
      }
    }),
    */
    /*
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Report],
      synchronize: true // This option is set to true only for development environment
      // This enables typeorm to look at the structure of our entities and then automatically update the structure of DB(Add/remove columns, change data type of columns etc)
      // But in production we have to write some migration code to effect these changes
      // Before deploying our application, use synchronize:false and never change it back to 'true'
    }),  // forRoot methods helps to automatically share db connection to all other modules inside thr project(UserModule, ReportsModule etc)
    */
    UsersModule, 
    ReportsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // We will be providing Validation Pipe here in App Module instead of doing it in main.ts file
    // This is beacause wehe testing end-to-end features, the test won't succeed as we are not setting up validation in beforeEachblock
    // To resolve this, we can create a separate setup-app.ts file and use it in both main.ts and e2e.ts file
    // But the more Nest appropriate way of doing things would be to wire these things to the app module itself
    // However this approach is more complex as the code becomes difficult to understand
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true
      }) // This ensures that every single request in our applicated is validated through validation pipe
    }
  ],
})
export class AppModule {
  constructor (
    private configService: ConfigService
  ) {}
  
  // Make use of following middleware for every single request that comes into our application - A globally scoped middleware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieSession({
      keys: [this.configService.get('COOKIE_KEY')],
    })).forRoutes('*')
  }
}

// Entities - Contains properties like id, name, email etc
// Repositories - Helps to implement methods like Create, Read, Update and Delete on database

// Repositories have a set of methods attached to them that are used to work with data inside our DB(can be found at typeorm.io/#/repository-api). These are-
// 1) create() - Makes new instance of entity but does not persist it to DB
// 2) save() - Adds or updates a record to DB
// 3) find() - Runs a query and returns a list of entities
// 4) findOne() - Run a quey, returning the first record matching the search criteria
// 5) remove() - Remove a record from DB


// Migrations
// It is a file with 2 functions defined inside of it - up() and down() - they describes how we want to change the structure of our DB
// up() describes how to 'update' the structure of our DB
// down() describes how to undo the steps in 'up()'
// if something goes wrong in 'up()' process, then we can undo that change using 'down()'
// Eg- up() - Add a table called 'users', Give the table 2 columns 'email' and 'password'
// Eg- down()- Delete the table called 'users'

// Creating and running migrations during development -
// 1) Stop Development server
// 2) Use TypeORM CLI to generate an empty migration file
// 3) Add some code to change our DB in migration file
// 4) Use TypeORM CLI to apply the migration to DB
// 5) DB is updated! Restart the development server

// TypeORM CLI only delas with migration and entity files. It has no idea about DB configurations in app.module or .env files
// So we cannot share DB connection settings while applying migrations
// So we have to define all our configuration for connecting to DB in one location that can be used equally well by either NEST or TypeORM CLI

// To load connection settings into TypeORM, we can use either of the following methods -
//  1) ormconfig.json file, 2) ormconfig.js file, 3) ormconfig.ts file, 4) ormconfig.yaml file, 5) Env variables, 6) Env variables in .env file
// We have to use one of these options to store our configurations at one place which then can be fed into TypeORM in these 3 diff scenarios
// Currently, we use TypeORMModule.forRootAsync({}) in app.module to load typeorm in Dev and Testing environments
// But we cannot get access to connection this way for TypeORM CLI
// We cannot use JSON or YAML file since we cannot change our DB URL, username or password in these for diff env
// We cannot use env variables and .enc file since our deployment platform(Production env) provides its own link to DB and all. So we cannot tell TypeORM to explicitly use other DB env variable
// We cannot use typeorm.ts file also since all ts files are converted to js files from src folder to dist folder. But by the time, nest finds typeorm.ts file outside the src folder in root directory, np more js conversion can take place
// We can use typeorm.js file, but it will throw error with /**entity.ts/ files, So we can instead change it to 'entity.js' instead 
// Catch22 situation - We cannot use ormconfig.ts ile with TypeoRM CLI env and we cannot use ormconfig.js within Teting env (since Tesing env expects TS files only due to jest-ts)
// So, to be able to use JS files, we can set 'allowJs' to true inside of tsconfig.json
// Finally, we have to change back entity.js to entity.ts for development and retain entity.ts for testing env using ternary operator