
import { Router } from "express";
import { changePassword, changeUserRole, createAgentAdminStaff, createClientUser, createDesignation, getMyProfile, myInfo,refreshAccessToken,signIn, signOut, toggleActive, updateDesignation, updateProfileImage, verifyAgent } from "../controller/authController.js";
import { checkAuthentication, requireAdmin, requireAdminOrStaff } from "../middleware/checkAuthentication.js";
import { uploadUserFiles } from "../middleware/userUpload.js";
import { revokeAssignedZones } from "../controller/zoneController.js";
import { optionalAuthentication } from "../middleware/optionalAuthentication.js";


const authRouter = Router();

// authRouter.post('/signup', signUp);
authRouter.post("/signin", signIn);

authRouter.post("/create-agent",checkAuthentication,requireAdmin,uploadUserFiles.any(),createAgentAdminStaff);
authRouter.post("/create-user",uploadUserFiles.any(),createClientUser);
authRouter.post("/verify-agent",checkAuthentication,requireAdmin,verifyAgent);
authRouter.post("/toggle-active",checkAuthentication,requireAdmin,toggleActive);
authRouter.post("/create-designation", checkAuthentication,requireAdmin, createDesignation);
authRouter.post("/signout",checkAuthentication,signOut);
authRouter.post("/change-password",checkAuthentication, changePassword); 
authRouter.post("/refresh", refreshAccessToken);

authRouter.put("/edit-designation/:id", checkAuthentication,requireAdmin,updateDesignation);
authRouter.put("/change-role/:id",checkAuthentication,requireAdmin,changeUserRole);
authRouter.put("/update-profile-image",checkAuthentication,uploadUserFiles.single("image"),updateProfileImage);
authRouter.delete("/revoke-zone", checkAuthentication,requireAdmin, revokeAssignedZones);

authRouter.get("/my-info",checkAuthentication, myInfo);
authRouter.get("/my-info-optional", optionalAuthentication, myInfo);
authRouter.get("/get-my-profile", checkAuthentication, getMyProfile);



export default authRouter;