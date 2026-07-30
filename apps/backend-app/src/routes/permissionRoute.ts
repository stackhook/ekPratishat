

import { Router } from "express";
import { checkAuthentication, requireAdmin } from "../middleware/checkAuthentication.js";
import { assignDesignation, getAllDesignations, getAllPermissions, getDesignationById } from "../controller/permissionController.js";

const permissionRouter = Router();

permissionRouter.get("/",checkAuthentication,requireAdmin,getAllPermissions);
permissionRouter.get("/designations",checkAuthentication,requireAdmin,getAllDesignations);
permissionRouter.get("/designation/:id", checkAuthentication,requireAdmin,getDesignationById);
permissionRouter.post("/assign-designation/:id", checkAuthentication,requireAdmin,assignDesignation);


export default permissionRouter;