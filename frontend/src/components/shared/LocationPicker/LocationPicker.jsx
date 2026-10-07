import { useState, useEffect, useRef } from "react";
import {
   MapContainer,
   TileLayer,
   Marker,
   useMapEvents,
   LayersControl,
   useMap,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { Search, MapPin, Navigation } from "lucide-react";
import styles from "./LocationPicker.module.css";
import LoadingSpinner from "../Loading/LoadingSpinner";

// Fix for missing marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
   iconUrl: icon,
   shadowUrl: iconShadow,
   iconSize: [25, 41],
   iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map center when position changes
const MapUpdater = ({ position }) => {
   const map = useMap();
   useEffect(() => {
      map.flyTo(position, map.getZoom());
   }, [position, map]);
   return null;
};

// Component to handle map clicks
const LocationMarker = ({ position, setPosition }) => {
   useMapEvents({
      click(e) {
         setPosition([e.latlng.lat, e.latlng.lng]);
      },
   });

   return position ? (
      <Marker
         position={position}
         draggable={true}
         eventHandlers={{
            dragend: (e) => {
               const marker = e.target;
               const position = marker.getLatLng();
               setPosition([position.lat, position.lng]);
            },
         }}
      />
   ) : null;
};

const LocationPicker = ({
   initialPosition = [9.03, 38.74], // Default: Addis Ababa
   initialAddress = "",
   onLocationSelect,
}) => {
   const [position, setPosition] = useState(initialPosition);
   const [query, setQuery] = useState(initialAddress);
   const [suggestions, setSuggestions] = useState([]);
   const [isSearching, setIsSearching] = useState(false);
   const [showSuggestions, setShowSuggestions] = useState(false);
   const [hasUserLocation, setHasUserLocation] = useState(false);

   // Get user's current location on mount if no initial address is provided
   useEffect(() => {
      if (!initialAddress && navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
            (pos) => {
               const { latitude, longitude } = pos.coords;
               setPosition([latitude, longitude]);
               setHasUserLocation(true);
               // Automatically fetch address for current location
               fetchAddress(latitude, longitude);
            },
            (err) => {
               console.warn("Geolocation access denied or failed", err);
            },
            { enableHighAccuracy: true }
         );
      }
   }, [initialAddress]);

   // Debounce search
   useEffect(() => {
      const timer = setTimeout(() => {
         if (query && isSearching && query.length > 2) {
            fetchSuggestions(query);
         }
      }, 1000);
      return () => clearTimeout(timer);
   }, [query, isSearching]);

   // Helper to fetch address from coordinates (Reverse Geocoding)
   const fetchAddress = async (lat, lng) => {
      try {
         const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
         );
         if (response.data && response.data.display_name) {
            setQuery(response.data.display_name);
            setIsSearching(false);
            onLocationSelect({
               lat,
               lng,
               address: response.data.display_name,
            });
         }
      } catch (error) {
         console.error("Failed to fetch address", error);
         onLocationSelect({ lat, lng, address: query });
      }
   };

   // Update parent when position changes (marker drag/click)
   useEffect(() => {
      if (position) {
         fetchAddress(position[0], position[1]);
      }
   }, [position]);

   const fetchSuggestions = async (searchText) => {
      try {
         const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
               searchText
            )}`
         );
         setSuggestions(response.data);
         setShowSuggestions(true);
      } catch (error) {
         console.error("Search failed", error);
      }
   };

   const handleSelectSuggestion = (suggestion) => {
      const lat = parseFloat(suggestion.lat);
      const lon = parseFloat(suggestion.lon);
      const newPos = [lat, lon];
      setPosition(newPos);
      setQuery(suggestion.display_name);
      setShowSuggestions(false);
      setIsSearching(false);
      onLocationSelect({ lat, lng: lon, address: suggestion.display_name });
   };

   const getUserLocation = () => {
      if (navigator.geolocation) {
         setIsSearching(true);
         navigator.geolocation.getCurrentPosition(
            (pos) => {
               const { latitude, longitude } = pos.coords;
               setPosition([latitude, longitude]);
               setIsSearching(false);
            },
            (err) => {
               console.error(err);
               setIsSearching(false);
            },
            { enableHighAccuracy: true }
         );
      }
   };

   return (
      <div className={styles.container}>
         <div className={styles.searchContainer}>
            <div className={styles.inputWrapper}>
               <Search size={18} className={styles.searchIcon} />
               <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                     setQuery(e.target.value);
                     setIsSearching(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for a location..."
                  className={styles.searchInput}
               />
               <button
                  className={styles.gpsButton}
                  onClick={getUserLocation}
                  title="Use my current location"
                  type="button"
               >
                  <Navigation size={18} />
               </button>
               {isSearching && query.length > 2 && suggestions.length === 0 && (
                  <div className={styles.spinner}>
                     <LoadingSpinner size="sm" />
                  </div>
               )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
               <ul className={styles.suggestionsList}>
                  {suggestions.map((item) => (
                     <li
                        key={item.place_id}
                        onClick={() => handleSelectSuggestion(item)}
                        className={styles.suggestionItem}
                     >
                        <MapPin size={16} className="mt-1 flex-shrink-0" />
                        <span>{item.display_name}</span>
                     </li>
                  ))}
               </ul>
            )}
         </div>

         <div className={styles.mapWrapper}>
            <MapContainer
               center={position}
               zoom={15}
               scrollWheelZoom={true}
               className={styles.map}
            >
               <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Street">
                     <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                     />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Satellite">
                     <TileLayer
                        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                     />
                  </LayersControl.BaseLayer>
               </LayersControl>

               <LocationMarker position={position} setPosition={setPosition} />
               <MapUpdater position={position} />
            </MapContainer>
            <div className={styles.helperText}>
               Click map or drag marker to pin location. Use layer icon for
               satellite view.
            </div>
         </div>
      </div>
   );
};

export default LocationPicker;
