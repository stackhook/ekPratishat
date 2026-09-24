import { Router } from "express";
import {
  checkAuthentication,
  requireAdmin,
  requireAdminOrStaff,
} from "../middleware/checkAuthentication.js";
import {
  addAmenity,
  addProperty,
  changePropertyHandler,
  checkFavourite,
  createCategory,
  deactivateListing,
  deleteProperty,
  featureListing,
  fetchUserFavourites,
  getAllCategories,
  getAllProperties,

  getAmenities,

  getListingById,

  getUserListings,
  toggleActivateListing,
  toggleFavourite,
  updateCategory,
  updateCoverImage,
  updateProperty,
  updatePropertyOwnerInfo,
  uploadCategoryImageFile,
  verifyListing,
} from "../controller/listingController.js";
import { uploadUserFiles } from "../middleware/userUpload.js";
import { addDistrictController, addMunicipalityController, addWardController } from "../controller/locationController.js";
import { checkPermission } from "../middleware/permissionsCheck.js";

const listingRouter = Router();

listingRouter.post(
  "/add-category",
  checkAuthentication,
  requireAdmin,
  uploadUserFiles.single("image"),
  createCategory,
);
listingRouter.post(
  "/add-property",
  checkAuthentication,
  uploadUserFiles.any(),
  addProperty,
);

listingRouter.post("/add-district", checkAuthentication, requireAdminOrStaff, addDistrictController);
listingRouter.post("/add-municipality", checkAuthentication, requireAdminOrStaff, addMunicipalityController);
listingRouter.post("/add-ward", checkAuthentication, requireAdminOrStaff, addWardController);
listingRouter.post("/amenities/add", checkAuthentication,requireAdmin, addAmenity);
listingRouter.post("/toggle-favourite", checkAuthentication, toggleFavourite);
listingRouter.post("/check-favourite", checkFavourite)

listingRouter.put("/edit-property/:id", checkAuthentication, uploadUserFiles.any(),checkPermission("properties", "update"), updateProperty);
listingRouter.put("/update-property-owner-info/:id", checkAuthentication,requireAdminOrStaff,checkPermission("properties", "update"), updatePropertyOwnerInfo);
listingRouter.put("/mark-verified",checkAuthentication,requireAdmin,verifyListing);
listingRouter.put("/mark-featured",checkAuthentication,requireAdmin,featureListing);
listingRouter.put("/update-cover/:id", checkAuthentication,checkPermission("properties", "update"),updateCoverImage);
listingRouter.put("/update-category/:id",checkAuthentication,requireAdmin,uploadUserFiles.single("image"),updateCategory);
listingRouter.put("/change-handler/:propertyId", checkAuthentication,requireAdminOrStaff, checkPermission("properties", "update"), changePropertyHandler);
listingRouter.put("/:id", checkAuthentication, requireAdmin, toggleActivateListing);

listingRouter.get("/categories", getAllCategories);
listingRouter.get("/my-listings", checkAuthentication, getUserListings);
listingRouter.get("/my-favourites",checkAuthentication,fetchUserFavourites);
listingRouter.get("/get-all",checkAuthentication,requireAdminOrStaff,getAllProperties);
listingRouter.get("/amenities", getAmenities);
listingRouter.get("/:id", getListingById);




listingRouter.delete("/delete/:id", checkAuthentication, requireAdmin, deleteProperty);
listingRouter.delete("/:id", checkAuthentication, deactivateListing);

export default listingRouter;
