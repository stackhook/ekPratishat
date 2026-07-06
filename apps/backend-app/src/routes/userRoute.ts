
import { Router } from "express";

import { checkAuthentication, requireAdmin, requireAdminOrStaff } from "../middleware/checkAuthentication.js";
import { getAdminOrStaff, getStaff, getUsers } from "../controller/usersController.js";

const userRouter = Router();

userRouter.get("/get-all", checkAuthentication, requireAdmin, getUsers);
userRouter.get("/get-staff", checkAuthentication, requireAdmin, getStaff);
userRouter.get("/get-admin-staff", checkAuthentication, requireAdminOrStaff, getAdminOrStaff)

export default userRouter;