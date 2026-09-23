declare namespace Express {
    interface Request {
        user : {
            id: string;
            sessionId: string;
            role: string;
            name:string;
            perms?:string[];
        };
        permissionScope?: "own" | "all";
    }
}