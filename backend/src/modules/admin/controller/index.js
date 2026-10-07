import { HTTP_STATUS } from "../../../constants/http.js";
import { USER_STATUS } from "../../../constants/user.js";
import AppError from "../../../utils/AppError.js";
import { successResponse } from "../../../utils/responseFormatter.js";
import { AdminService } from "../service/index.js";

// Create admin controller
export const createAdmin = async (req, res, next) => {
   try {
      const userData = req.body;
      const data = await AdminService.createAdmin(userData);

      return successResponse(res, {
         message: "Admin created successfully",
         data,
         statusCode: HTTP_STATUS.CREATED,
      });
   } catch (error) {
      next(error);
   }
};

// Get users controller
export const getAllUsers = async (req, res, next) => {
   try {
      const role = req?.query?.role;
      const status = req?.query?.status;
      const search = req?.query?.search;
      const page = req?.query?.page;
      const limit = req?.query?.limit;
      const isSuperAdmin = req?.user?.role === "super_admin";

      const { users, pagination } = await AdminService.getAllUsers(
         role,
         status,
         search,
         page,
         limit,
         isSuperAdmin
      );

      return successResponse(res, {
         message: "Success",
         data: { users, pagination },
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Update user status controller
export const updateUserStatus = async (req, res, next) => {
   try {
      const id = req.params?.id;
      const { status } = req.body;

      if (!id) {
         throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
      }
      if (!status) {
         throw new AppError("Status is required", HTTP_STATUS.BAD_REQUEST);
      }
      if (
         ![
            USER_STATUS.ACTIVE,
            USER_STATUS.INACTIVE,
            USER_STATUS.BANNED,
         ].includes(status)
      ) {
         throw new AppError(
            "Invalid status. status must be active, inactive or banned ",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      const data = await AdminService.updateUserStatus(id, status);

      return successResponse(res, {
         message: "User status updated successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Update user role controller
export const updateUserRole = async (req, res, next) => {
   try {
      const id = req.params?.id;
      const { role } = req.body;

      if (!id) {
         throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await AdminService.updateUserRole(id, role);

      return successResponse(res, {
         message: "User role updated successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Remove user controller
export const removeUser = async (req, res, next) => {
   try {
      const id = req.params?.id;

      if (!id) {
         throw new AppError("User id is required", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await AdminService.removeUser(id);

      return successResponse(res, {
         message: "User removed successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Create a new Amenities
export const createAmenity = async (req, res, next) => {
   try {
      const { name, icon_url, icon_public_id } = req.body;

      // Basic validation
      if (!name || !icon_url || !icon_public_id) {
         throw new AppError("All fields are required", HTTP_STATUS.BAD_REQUEST);
      }
      // Call service to create room type
      const data = await AdminService.createAmenity({
         name,
         icon_url,
         icon_public_id,
      });

      return successResponse(res, {
         message: "Amenities created successfully",
         data,
         statusCode: HTTP_STATUS.CREATED,
      });
   } catch (error) {
      next(error);
   }
};

// Update amenities controller
export const updateAmenity = async (req, res, next) => {
   try {
      const id = req.params?.id;
      const updateData = req.body;

      if (!id) {
         throw new AppError(
            "Amenities id is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      const data = await AdminService.updateAmenity(id, updateData);

      return successResponse(res, {
         message: "Amenities updated successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Remove amenities controller
export const removeAmenity = async (req, res, next) => {
   try {
      const id = req.params?.id;

      if (!id) {
         throw new AppError(
            "Amenities id is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }

      const data = await AdminService.removeAmenity(id);

      return successResponse(res, {
         message: "Amenities removed successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Create bed type controller
export const createBedType = async (req, res, next) => {
   try {
      const { name } = req.body;

      // Basic validation
      if (!name) {
         throw new AppError(
            "Bed type name is required",
            HTTP_STATUS.BAD_REQUEST
         );
      }
      // Call service to create room type
      const data = await AdminService.createBedType(name);

      return successResponse(res, {
         message: "Bed type created successfully",
         data,
         statusCode: HTTP_STATUS.CREATED,
      });
   } catch (error) {
      next(error);
   }
};

// Update bed type controller
export const updateBedType = async (req, res, next) => {
   try {
      const id = req?.params?.id;
      const name = req?.body?.name;

      if (!id) {
         throw new AppError("Bed type id is required", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await AdminService.updateBedType(id, name);

      return successResponse(res, {
         message: "Bed type updated successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Remove bed type controller
export const removeBedType = async (req, res, next) => {
   try {
      const id = req.params?.id;

      if (!id) {
         throw new AppError("Bed type id is required", HTTP_STATUS.BAD_REQUEST);
      }

      const data = await AdminService.removeBedType(id);

      return successResponse(res, {
         message: "Bed type removed successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Get admin dashboard data controller
export const getAdminDashboardData = async (req, res, next) => {
   try {
      const data = await AdminService.getAdminDashboardData();

      return successResponse(res, {
         message: "Admin dashboard data fetched successfully",
         data,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};
