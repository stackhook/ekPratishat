import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface TokenPayload{
    sessionId: string;
    userId: string;
    role: string;
    name:string;
    profileImageUrl:string | null;
    perms?:string[];
}

export const generateToken = ({sessionId, userId, role, name, profileImageUrl,perms }: TokenPayload) => {
    return jwt.sign({ sessionId, userId, role, name, profileImageUrl,perms }, JWT_SECRET , {
        expiresIn:"1m" 
    })
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}


// Refresh token
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

// Store this hash in Session.refreshTokenHash
export const hashRefreshToken = (refreshToken: string): string => {
  return crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
};