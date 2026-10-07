import { ObjectId } from "bson";

// Generate a random  object ID
export const generateId = () => {
   const id = new ObjectId().toHexString();
   return id;
};

// Generate a random booking reference
export const generateBookingReference = (id) => {
   return "RB-" + id.substring(0, 10).toUpperCase();
};
