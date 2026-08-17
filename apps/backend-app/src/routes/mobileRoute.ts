import { Router } from "express";
import { getAllProperties, getRecentListings } from "../controller/listingController.js";
import { getMyInfo, mobileAuthController } from "../mobile/auth.controller.js";

const mobileRouter = Router();

mobileRouter.post("/auth", mobileAuthController);

mobileRouter.get("/recent-listings", getRecentListings);
mobileRouter.get("/properties", getAllProperties);
mobileRouter.get("/me", getMyInfo);

export default mobileRouter;