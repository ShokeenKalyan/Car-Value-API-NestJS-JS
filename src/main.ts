import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module';
// const cookieSession = require('cookie-session') // We cannot use import statement with cookie-session due to some conflicting settings in tsconfig.json file

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /*
  app.use(cookieSession({
    keys: ['asdfg'] // This string is going to be used to encrypt the information stored inside the cookie
  }))
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true // It ensures that incoming requests don't have extraneous properties in the body that we are not expecting
      // If we add another property in body say username, then it will be stripped out automatically
      // So if someone tries to mark user as admin, then user property won't be parsed
    })
  )
    */
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
