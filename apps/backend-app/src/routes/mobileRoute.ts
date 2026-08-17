import { Router } from "express";
import { getAllProperties, getRecentListings } from "../controller/listingController.js";
import { mobileAuthController } from "../mobile/auth.controller.js";

const mobileRouter = Router();

mobileRouter.post("/auth", mobileAuthController);

mobileRouter.get("/recent-listings", getRecentListings);
mobileRouter.get("/properties", getAllProperties);

export default mobileRouter;