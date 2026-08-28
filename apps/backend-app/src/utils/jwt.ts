import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface TokenPayload{
    userId: string;
    role: string;
    name:string;
    profileImageUrl:string | null;
    perms?:string[];
}

export const generateToken = ({ userId, role, name, profileImageUrl,perms }: TokenPayload) => {
    return jwt.sign({ userId, role, name, profileImageUrl,perms }, JWT_SECRET , {
        expiresIn: role === "client" ? "30d" : "1d" //30days for client, 1day for admin and staff
    })
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}