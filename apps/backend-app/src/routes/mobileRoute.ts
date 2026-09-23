import { Router } from "express";
import { fetchLocationData, fetchUserFavourites, getAllProperties, getRecentListings } from "../controller/listingController.js";
import { getMyInfo, mobileAuthController, mobileSignOut } from "../mobile/auth.controller.js";
import { optionalAuth } from "../middleware/optionlAuth.js";
import { fetchFavourites, getMobileListing } from "../mobile/listing.controller.js";
import { checkAuthentication } from "../middleware/checkAuthentication.js";

const mobileRouter = Router();

mobileRouter.post("/auth", mobileAuthController);
mobileRouter.post("/auth/signout", checkAuthentication, mobileSignOut);  

mobileRouter.get("/recent-listings", getRecentListings);
mobileRouter.get("/properties", getAllProperties);
mobileRouter.get("/me", checkAuthentication, getMyInfo);
mobileRouter.get("/location",fetchLocationData);
mobileRouter.get("/property/:id",optionalAuth, getMobileListing);
mobileRouter.get("/my-favourites", checkAuthentication, fetchFavourites);


export default mobileRouter;