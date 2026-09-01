import { Router } from "express";
import { fetchLocationData, fetchUserFavourites, getAllProperties, getRecentListings } from "../controller/listingController.js";
import { getMyInfo, mobileAuthController } from "../mobile/auth.controller.js";
import { optionalAuth } from "../middleware/optionlAuth.js";
import { getMobileListing } from "../mobile/listing.controller.js";
import { checkAuthentication } from "../middleware/checkAuthentication.js";

const mobileRouter = Router();

mobileRouter.post("/auth", mobileAuthController);

mobileRouter.get("/recent-listings", getRecentListings);
mobileRouter.get("/properties", getAllProperties);
mobileRouter.get("/me", getMyInfo);
mobileRouter.get("/location",fetchLocationData);
mobileRouter.get("/property/:id",optionalAuth, getMobileListing);
mobileRouter.get("/my-favourites", checkAuthentication, fetchUserFavourites);


export default mobileRouter;