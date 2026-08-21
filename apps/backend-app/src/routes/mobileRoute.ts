import { Router } from "express";
import { fetchLocationData, getAllProperties, getRecentListings } from "../controller/listingController.js";
import { getMyInfo, mobileAuthController } from "../mobile/auth.controller.js";
import { checkAuthentication } from "../middleware/checkAuthentication.js";

const mobileRouter = Router();

mobileRouter.post("/auth", mobileAuthController);

mobileRouter.get("/recent-listings", getRecentListings);
mobileRouter.get("/properties", getAllProperties);
mobileRouter.get("/me", getMyInfo);
mobileRouter.get("/location",checkAuthentication, fetchLocationData);
export default mobileRouter;