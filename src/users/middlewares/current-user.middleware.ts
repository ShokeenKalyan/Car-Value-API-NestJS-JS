import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { UsersService } from "../users.service";
import { User } from "../user.entity";

// This is going to add additional property currentUser on the request object
// Find express library and the interface inside it called Request and then add currentUser property(optional) of type User Entity to it
declare global {
    namespace Express {
        interface Request {
            currentUser?: User
        }
    }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor(
        private usersService: UsersService
    ) {}
    async use(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.session || {}

        if (userId) {
            const user = await this.usersService.findOne(userId)
            
            req.currentUser = user
        }

        next()
    }
}