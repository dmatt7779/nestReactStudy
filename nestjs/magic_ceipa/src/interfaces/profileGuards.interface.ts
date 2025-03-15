import { Request } from "express";
import { Role } from "src/common/enums/rol.enum";

export interface RequestWithUser extends Request{
    user: {
        email: string;
        role: Role;
    }
}

