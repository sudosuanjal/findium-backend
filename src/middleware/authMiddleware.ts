import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  sub: string;
  "custom:role"?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "token not found" });
      return;
    }

    try {
      const decodedToken = jwt.decode(token) as DecodedToken;
      const userRole = decodedToken["custom:role"] || "";
      req.user = {
        id: decodedToken.sub,
        role: userRole,
      };

      const hasAccess = allowedRoles.includes(userRole.toLowerCase());
      if (!hasAccess) {
        res.status(403).json({ message: "access denied" });
        return;
      }

      next();
    } catch (error) {
      console.error("failed to decode the token: ", error);
      res.status(400).json({ message: "invalid token" });
      return;
    }
  };
};
