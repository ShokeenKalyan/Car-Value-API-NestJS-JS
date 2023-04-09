
Types of Testing in NestJS

1) Unit Testing - Make sure that individual methods on a class are working correctly
2) Integration/End-to-End Testing - Test the full flow of a feature

# To test authservice, we need to create a copy of AuthService
# But Authservice depends upon UserService which in turn depends upon UserRepository which in turn depends upon SQLlite

# To avoid creating all these dependencies, we are going to use Dependency Injection System
# We will be creating a fake copy of UserService - a temporary class in a test file that has only certain methods which we want to use
# Then we would be creating an instance of authService using that fake userService
# This will involving creating a DI container for testing which gets tricked into thinking that Auth Service depends upon a class that is a basic implementation of Users Service