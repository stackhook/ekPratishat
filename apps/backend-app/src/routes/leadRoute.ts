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

const leadRouter = Router();

leadRouter.post(
  "/add",
  checkAuthentication,
  requireAdminOrStaff,
  uploadUserFiles.single("image"),
  addLead,
);

leadRouter.post("/poke/:id", checkAuthentication, requireAdmin, pokeLead);

leadRouter.get("/", checkAuthentication, requireAdminOrStaff, getLeads);
leadRouter.get("/user-leads", checkAuthentication, getUserLeads);
leadRouter.get("/today-followups", checkAuthentication,requireAdmin,getTodayFollowUpLead);
leadRouter.get("/:id", checkAuthentication, requireAdminOrStaff, getLeadById);

leadRouter.put(
  "/status/:id",
  checkAuthentication,
  requireAdminOrStaff,
  updateLeadStatus,
);
leadRouter.put(
  "/follow-up/:id",
  checkAuthentication,
  requireAdminOrStaff,
  updateFollowUpTime,
);
leadRouter.put(
  "/edit-basic/:id",
  checkAuthentication,
  requireAdminOrStaff,
  updateLeadBasicInformation,
);
leadRouter.put(
  "/change-handler/:id",
  checkAuthentication,
  requireAdminOrStaff,
  changeHandler,
);
leadRouter.put(
  "/update-compulsory-parameter/:id",
  checkAuthentication,
  requireAdminOrStaff,
  updateCompulsoryParameter
)

export default leadRouter;
