/**
 *
 * *  Cache Constants
 *
 */

// Cache keys
export const CACHE_KEYS = {
   USER: (userId) => `user:${userId}`,
   HOTEL: (hotelId) => `hotel:${hotelId}`,
   ROOM: (roomId) => `room:${roomId}`,
   HOTEL_SEARCH: (params) => `hotel_search:${JSON.stringify(params)}`,
   AVAILABLE_ROOMS: (hotelId, dates) => `available_rooms:${hotelId}:${dates}`,
};
