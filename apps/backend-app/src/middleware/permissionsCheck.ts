import { Request, Response, NextFunction } from "express";


export const checkPermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1. Admins automatically bypass permission checks
    if (user.role === "admin") {
      req.permissionScope = "all";
      return next();
    }

    if(user.role === "client") {
      req.permissionScope = "own";
      return next();
    }

    // 2. Reject non-staff users if missing explicit role handlers
    if (user.role !== "staff") {
      return res.status(403).json({ message: "Forbidden: Access restricted" });
    }

    const perms = user.perms || [];

    // 3. Match against formatted compact string targets
    const targetAll = `${resource}:${action}:all`;
    const targetOwn = `${resource}:${action}:own`;

    const hasAll = perms.includes(targetAll);
    const hasOwn = perms.includes(targetOwn);

    if (!hasAll && !hasOwn) {
      return res.status(403).json({
        message: `Forbidden: Missing permission to ${action} ${resource}`,
      });
    }

    // 4. Set resolved scope ('all' takes priority over 'own')
    req.permissionScope = hasAll ? "all" : "own";

    return next();
  };
};