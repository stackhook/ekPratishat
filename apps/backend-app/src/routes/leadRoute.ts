import { Router } from "express";
import {
  addLead,
  changeHandler,
  getLeadById,
  getLeads,
  getTodayFollowUpLead,
  getUserLeads,
  pokeLead,
  updateCompulsoryParameter,
  updateFollowUpTime,
  updateLeadBasicInformation,
  updateLeadStatus,
} from "../controller/leadController.js";
import {
  checkAuthentication,
  requireAdmin,
  requireAdminOrStaff,
} from "../middleware/checkAuthentication.js";
import { uploadUserFiles } from "../middleware/userUpload.js";
import { checkPermission } from "../middleware/permissionsCheck.js";

const leadRouter = Router();

leadRouter.post(
  "/add",
  checkAuthentication,
  requireAdminOrStaff,
  checkPermission("leads", "create"),
  uploadUserFiles.single("image"),
  addLead,
);

leadRouter.post("/poke/:id", checkAuthentication, requireAdmin, pokeLead);

leadRouter.get("/", checkAuthentication, requireAdminOrStaff, getLeads);
leadRouter.get("/user-leads", checkAuthentication, getUserLeads);
leadRouter.get("/today-followups", checkAuthentication,requireAdminOrStaff, getTodayFollowUpLead);
leadRouter.get("/:id", checkAuthentication, requireAdminOrStaff,checkPermission("leads","read"), getLeadById);

leadRouter.put(
  "/status/:id",
  checkAuthentication,
  requireAdminOrStaff,
  checkPermission("leads","update"),
  updateLeadStatus,
);
leadRouter.put(
  "/follow-up/:id",
  checkAuthentication,
  requireAdminOrStaff,
  checkPermission("leads", "update"),
  updateFollowUpTime,
);
leadRouter.put(
  "/edit-basic/:id",
  checkAuthentication,
  requireAdminOrStaff,
  checkPermission("leads", "update"),
  updateLeadBasicInformation,
);
leadRouter.put(
  "/change-handler/:id",
  checkAuthentication,
  requireAdminOrStaff,
  checkPermission("leads", "update"),
  changeHandler,
);
leadRouter.put(
  "/update-compulsory-parameter/:id",
  checkAuthentication,
  requireAdminOrStaff,
  checkPermission("leads","update"),
  updateCompulsoryParameter
)

export default leadRouter;
