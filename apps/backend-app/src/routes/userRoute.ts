
import { Router } from "express";

import { checkAuthentication, requireAdmin, requireAdminOrStaff } from "../middleware/checkAuthentication.js";
import { getAdminOrStaff, getStaff, getTotalValuation, getUsers } from "../controller/usersController.js";

const userRouter = Router();

userRouter.get("/get-all", checkAuthentication, requireAdmin, getUsers);
userRouter.get("/get-staff", checkAuthentication, requireAdmin, getStaff);
userRouter.get("/get-admin-staff", checkAuthentication, requireAdminOrStaff, getAdminOrStaff);
userRouter.get("/my-total-property-value",checkAuthentication, requireAdminOrStaff, getTotalValuation);

export default userRouter;