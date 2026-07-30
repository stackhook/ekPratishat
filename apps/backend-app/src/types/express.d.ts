declare namespace Express {
    interface Request {
        user : {
            id: string;
            role: string;
            name:string;
            perms?:string[];
        }
    }
}