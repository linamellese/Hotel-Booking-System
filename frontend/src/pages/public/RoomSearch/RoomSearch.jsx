import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Filter, MapPin, Star, ChevronDown, X, Hotel, Bed } from "lucide-react";
import { customerApi } from "../../../api/customer";
import Button from "../../../components/shared/Button/Button";
import Card from "../../../components/shared/Card/Card";
import Input from "../../../components/shared/Input/Input";
import Pagination from "../../../components/shared/Pagination/Pagination";
import styles from "./RoomSearch.module.css";
import { formatCurrency } from "../../../utils/helpers";

const RoomSearch = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const [inputValues, setInputValues] = useState({
      search: "",
      minPrice: "",
      maxPrice: "",
      bedType: "",
   });
   const [searchParams, setSearchParams] = useState({
      search: "",
      minPrice: "",
      maxPrice: "",
      bedType: "",
   });
   const [showFilters, setShowFilters] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const pageSize = 10;
   const isMounted = useRef(false);

   // Parse query parameters from URL and set search params
   useEffect(() => {
      const params = new URLSearchParams(location.search);

      const initialParams = {
         search: params.get("search") || "",
         minPrice: params.get("minPrice") || "",
         maxPrice: params.get("maxPrice") || "",
         bedType: params.get("bedType") || "",
      };

      setSearchParams(initialParams);
      setInputValues(initialParams);

      // Set current page from URL or default to 1
      const pageParam = params.get("page");
      const page = pageParam ? parseInt(pageParam, 10) : 1;
      setCurrentPage(page);

      // Mark as mounted after first render
      if (!isMounted.current) {
         isMounted.current = true;
      }
   }, [location.search]);

   // Debounce search params update
   useEffect(() => {
      // Skip the first render/sync to avoid double navigation or overwrite
      if (!isMounted.current) return;

      const timer = setTimeout(() => {
         const params = new URLSearchParams();

         if (inputValues.search && inputValues.search.trim() !== "") {
            params.set("search", inputValues.search.trim());
         }
         if (inputValues.minPrice && inputValues.minPrice !== "") {
            params.set("minPrice", inputValues.minPrice);
         }
         if (inputValues.maxPrice && inputValues.maxPrice !== "") {
            params.set("maxPrice", inputValues.maxPrice);
         }
         if (inputValues.bedType && inputValues.bedType !== "") {
            params.set("bedType", inputValues.bedType);
         }

         // Check if the generated params match the current URL to avoid redundant navigation
         // We compare with the *current* location search (excluding page, as filter change resets page)
         const currentParams = new URLSearchParams(location.search);
         const currentSearch = currentParams.get("search") || "";
         const currentMin = currentParams.get("minPrice") || "";
         const currentMax = currentParams.get("maxPrice") || "";
         const currentBed = currentParams.get("bedType") || "";

         // Normalize for comparison
         const hasChanged =
            (inputValues.search || "") !== currentSearch ||
            (inputValues.minPrice || "") !== currentMin ||
            (inputValues.maxPrice || "") !== currentMax ||
            (inputValues.bedType || "") !== currentBed;

         if (hasChanged) {
            params.set("page", "1");
            navigate(`/room-types?${params.toString()}`);
         }
      }, 500); // 500ms debounce

      return () => clearTimeout(timer);
   }, [inputValues, navigate, location.search]);

   // Determine if we should fetch data
   const shouldFetchData = () => {
      // Always fetch if we have search params in URL
      if (location.search !== "") return true;

      // Fetch if component is mounted (not initial mount)
      if (isMounted.current) return true;

      return false;
   };

   // Fetch rooms based on search criteria
   const { data: searchResults, isLoading } = useQuery({
      queryKey: ["roomSearch", searchParams, currentPage],
      queryFn: async () => {
         const queryParams = {
            page: currentPage,
            limit: pageSize,
         };

         // Only add search param if it's not empty
         if (searchParams.search && searchParams.search.trim() !== "") {
            queryParams.search = searchParams.search.trim();
         }

         // Only add numeric params if they have values
         if (searchParams.minPrice && searchParams.minPrice !== "") {
            queryParams.minPrice = parseFloat(searchParams.minPrice);
         }

         if (searchParams.maxPrice && searchParams.maxPrice !== "") {
            queryParams.maxPrice = parseFloat(searchParams.maxPrice);
         }

         // Only add bedType if selected
         if (searchParams.bedType && searchParams.bedType !== "") {
            queryParams.bedType = searchParams.bedType;
         }
         const response = await customerApi.searchRoomTypes(queryParams);

         return response.data;
      },
      enabled: shouldFetchData(),
      refetchOnWindowFocus: false,
      keepPreviousData: true,
   });

   // Scroll to results when search results change
   useEffect(() => {
      if (isMounted.current) {
         window.scrollTo({ top: 300, behavior: "smooth" });
      }
   }, [searchResults, currentPage]);

   // Scroll to top when page changes
   useEffect(() => {
      if (isMounted.current) {
         window.scrollTo({ top: 0, behavior: "smooth" });
      }
   }, []);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setInputValues((prev) => ({ ...prev, [name]: value }));
   };

   const handleFilterToggle = () => {
      setShowFilters(!showFilters);
   };

   const clearFilters = () => {
      const clearedParams = {
         ...searchParams,
         minPrice: "",
         maxPrice: "",
         bedType: "",
      };

      setSearchParams(clearedParams);

      // Build query string with only search param (if exists)
      const params = new URLSearchParams();
      if (clearedParams.search && clearedParams.search.trim() !== "") {
         params.set("search", clearedParams.search.trim());
      }

      params.set("page", "1");
      const queryString = params.toString();

      setCurrentPage(1);

      if (queryString) {
         navigate(`/room-types?${queryString}`);
      } else {
         navigate("/room-types");
      }
   };

   // Navigate to room details page
   const handleRoomClick = (roomId) => {
      // add state to know where it come from
      navigate(`/room-types/${roomId}`, {
         state: { from: location.pathname + location.search },
      });
   };

   // Function to remove specific filter with immediate search
   const removeFilter = (filterName) => {
      const updatedParams = { ...searchParams, [filterName]: "" };
      setSearchParams(updatedParams);

      // Build query string with updated params
      const params = new URLSearchParams();

      if (updatedParams.search && updatedParams.search.trim() !== "") {
         params.set("search", updatedParams.search.trim());
      }

      if (updatedParams.minPrice && updatedParams.minPrice !== "") {
         const minPrice = parseFloat(updatedParams.minPrice);
         if (!isNaN(minPrice) && minPrice >= 0) {
            params.set("minPrice", updatedParams.minPrice);
         }
      }

      if (updatedParams.maxPrice && updatedParams.maxPrice !== "") {
         const maxPrice = parseFloat(updatedParams.maxPrice);
         if (!isNaN(maxPrice) && maxPrice >= 0) {
            params.set("maxPrice", updatedParams.maxPrice);
         }
      }

      if (updatedParams.bedType && updatedParams.bedType !== "") {
         params.set("bedType", updatedParams.bedType);
      }

      params.set("page", "1");
      const queryString = params.toString();
      setCurrentPage(1);

      if (queryString) {
         navigate(`/room-types?${queryString}`);
      } else {
         navigate("/room-types");
      }
   };

   // Handle page change
   const handlePageChange = (page) => {
      setCurrentPage(page);

      // Build URL with current search params and new page
      let params = new URLSearchParams();
      if (searchParams.search && searchParams.search.trim() !== "") {
         params.set("search", searchParams.search.trim());
      }
      if (searchParams.minPrice && searchParams.minPrice !== "") {
         params.set("minPrice", searchParams.minPrice);
      }
      if (searchParams.maxPrice && searchParams.maxPrice !== "") {
         params.set("maxPrice", searchParams.maxPrice);
      }
      if (searchParams.bedType && searchParams.bedType !== "") {
         params.set("bedType", searchParams.bedType);
      }

      // Update or add page parameter
      params.set("page", page.toString());

      // Navigate to new URL
      navigate(`/room-types?${params.toString()}`);
   };

   const bedTypes = [
      { value: "single", label: "Single Bed" },
      { value: "double", label: "Double Bed" },
      { value: "queen", label: "Queen Bed" },
      { value: "king", label: "King Bed" },
      { value: "twin", label: "Twin Beds" },
   ];

   const totalPages = searchResults?.pagination?.total_pages || 1;
   const totalItems = searchResults?.pagination?.total || 0;

   return (
      <div className={styles.roomSearch}>
         {/* Search Header */}
         <div className={styles.searchHeader}>
            <div className={styles.searchHeader__content}>
               <h1 className={styles.searchHeader__title}>
                  Find Your Perfect Stay
               </h1>
               <p className={styles.searchHeader__subtitle}>
                  {searchResults?.pagination?.total
                     ? `${searchResults.pagination.total} room types found`
                     : "Search for amazing places to stay"}
               </p>
            </div>
         </div>

         <div className={styles.searchContent}>
            {/* Filters Sidebar */}
            <aside
               className={`${styles.filters} ${
                  showFilters ? styles["filters--open"] : ""
               }`}
            >
               <div className={styles.filters__header}>
                  <h3 className={styles.filters__title}>Filters</h3>
                  <button
                     onClick={handleFilterToggle}
                     className={styles.filters__close}
                     aria-label="Close filters"
                  >
                     <X size={20} />
                  </button>
               </div>

               <div className={styles.filters__content}>
                  {/* Price Range */}
                  <div className={styles.filterSection}>
                     <h4 className={styles.filterSection__title}>
                        Price Range
                     </h4>
                     <div className={styles.priceRange}>
                        <Input
                           type="number"
                           name="minPrice"
                           value={inputValues.minPrice}
                           onChange={handleInputChange}
                           placeholder="Min"
                           min="0"
                           step="0.01"
                        />
                        <span className={styles.priceRange__separator}>-</span>
                        <Input
                           type="number"
                           name="maxPrice"
                           value={inputValues.maxPrice}
                           onChange={handleInputChange}
                           placeholder="Max"
                           min="0"
                           step="0.01"
                        />
                     </div>
                  </div>

                  {/* Bed Type */}
                  <div className={styles.filterSection}>
                     <h4 className={styles.filterSection__title}>Bed Type</h4>
                     <div className={styles.bedTypes}>
                        <label key="all" className={styles.bedType}>
                           <input
                              type="radio"
                              name="bedType"
                              value=""
                              checked={inputValues.bedType === ""}
                              onChange={handleInputChange}
                              className={styles.bedType__input}
                           />
                           <span className={styles.bedType__label}>
                              All Types
                           </span>
                        </label>
                        {bedTypes.map((bed) => (
                           <label key={bed.value} className={styles.bedType}>
                              <input
                                 type="radio"
                                 name="bedType"
                                 value={bed.value}
                                 checked={inputValues.bedType === bed.value}
                                 onChange={handleInputChange}
                                 className={styles.bedType__input}
                              />
                              <span className={styles.bedType__label}>
                                 {bed.label}
                              </span>
                           </label>
                        ))}
                     </div>
                  </div>

                  {/* Clear Filters */}
                  <div className={styles.filterActions}>
                     <Button
                        variant="outline"
                        fullWidth
                        onClick={clearFilters}
                        disabled={
                           !searchParams.minPrice &&
                           !searchParams.maxPrice &&
                           !searchParams.bedType
                        }
                     >
                        Clear Filters
                     </Button>
                  </div>
               </div>
            </aside>

            {/* Results */}
            <main className={styles.results}>
               {/* Mobile Filter Toggle */}
               <div className={styles.mobileFilters}>
                  <Button
                     variant="outline"
                     onClick={handleFilterToggle}
                     fullWidth
                  >
                     <Filter size={18} />
                     Filters
                     {(searchParams.minPrice ||
                        searchParams.maxPrice ||
                        searchParams.bedType) && (
                        <span className={styles.filterCount}>●</span>
                     )}
                     <ChevronDown size={18} />
                  </Button>
               </div>

               {/* Active Filters */}
               {(searchParams.minPrice ||
                  searchParams.maxPrice ||
                  searchParams.bedType) && (
                  <div className={styles.activeFilters}>
                     <div className={styles.activeFilters__list}>
                        {searchParams.minPrice && (
                           <span className={styles.activeFilter}>
                              Min: ${searchParams.minPrice}
                              <button
                                 onClick={() => removeFilter("minPrice")}
                                 className={styles.activeFilter__remove}
                              >
                                 ×
                              </button>
                           </span>
                        )}
                        {searchParams.maxPrice && (
                           <span className={styles.activeFilter}>
                              Max: ${searchParams.maxPrice}
                              <button
                                 onClick={() => removeFilter("maxPrice")}
                                 className={styles.activeFilter__remove}
                              >
                                 ×
                              </button>
                           </span>
                        )}
                        {searchParams.bedType && (
                           <span className={styles.activeFilter}>
                              {bedTypes.find(
                                 (b) => b.value === searchParams.bedType
                              )?.label || searchParams.bedType}
                              <button
                                 onClick={() => removeFilter("bedType")}
                                 className={styles.activeFilter__remove}
                              >
                                 ×
                              </button>
                           </span>
                        )}
                     </div>
                     <Button
                        variant="ghost"
                        size="small"
                        onClick={clearFilters}
                        className={styles.clearAll_btn}
                     >
                        Clear All
                     </Button>
                  </div>
               )}

               {/* Loading State */}
               {isLoading && (
                  <div className={styles.loadingGrid}>
                     {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={styles.roomCardSkeleton}>
                           <div className={styles.roomCardSkeleton__image} />
                           <div className={styles.roomCardSkeleton__content}>
                              <div className={styles.roomCardSkeleton__title} />
                              <div
                                 className={
                                    styles.roomCardSkeleton__description
                                 }
                              />
                              <div className={styles.roomCardSkeleton__price} />
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {/* Results Grid */}
               {!isLoading && searchResults?.roomTypes?.length > 0 && (
                  <>
                     <div className={styles.resultsGrid}>
                        {searchResults.roomTypes.map((roomType) => (
                           <Card
                              key={roomType.id}
                              className={styles.roomCard}
                              onClick={() => handleRoomClick(roomType.id)}
                           >
                              <div className={styles.roomCard__image}>
                                 <img
                                    src={
                                       roomType.main_image_url ||
                                       "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3"
                                    }
                                    alt={roomType.name}
                                    className={styles.roomCard__img}
                                 />
                                 <div className={styles.roomCard__badge}>
                                    <Star size={12} fill="currentColor" />
                                    <span>
                                       {roomType.average_rating || "4.5"}
                                    </span>
                                 </div>
                              </div>
                              <div className={styles.roomCard__content}>
                                 <div className={styles.roomCard__header}>
                                    <h3 className={styles.roomCard__title}>
                                       {roomType.name}
                                    </h3>
                                    <p className={styles.roomCard__bedType}>
                                       <span
                                          className={
                                             styles.roomCard__numberOfBed
                                          }
                                       >
                                          {roomType.number_of_beds}
                                       </span>
                                       <Bed size={14} />
                                       {roomType.bed_type
                                          .charAt(0)
                                          .toUpperCase() +
                                          roomType.bed_type.slice(1)}{" "}
                                       Bed
                                    </p>
                                 </div>
                                 <p className={styles.roomCard__location}>
                                    <MapPin size={14} />
                                    {roomType.hotel_location}
                                 </p>

                                 <div className={styles.roomCard__location}>
                                    <Hotel size={14} />
                                    {roomType.hotel_name}
                                 </div>
                                 <div className={styles.roomCard__footer}>
                                    <div>
                                       <span className={styles.roomCard__price}>
                                          {formatCurrency(
                                             roomType.price_per_night
                                          )}
                                       </span>
                                       <span
                                          className={styles.roomCard__period}
                                       >
                                          {" "}
                                          / night
                                       </span>
                                    </div>
                                    <Button
                                       variant="outline"
                                       size="small"
                                       onClick={() =>
                                          handleRoomClick(roomType.id)
                                       }
                                    >
                                       View
                                    </Button>
                                 </div>
                              </div>
                           </Card>
                        ))}
                     </div>

                     {/* Pagination */}
                     {searchResults?.roomTypes?.length > 0 && (
                        <Pagination
                           currentPage={currentPage}
                           totalPages={totalPages}
                           totalItems={totalItems}
                           pageSize={pageSize}
                           onPageChange={handlePageChange}
                           showPageSizeOptions={false}
                           className={styles.pagination}
                        />
                     )}
                  </>
               )}

               {/* No Results */}
               {!isLoading && searchResults?.roomTypes.length === 0 && (
                  <div className={styles.noResults}>
                     <div className={styles.noResults__icon}>🏨</div>
                     <h3 className={styles.noResults__title}>No rooms found</h3>
                     <p className={styles.noResults__message}>
                        {searchParams.search !== ""
                           ? "Try adjusting your search criteria"
                           : "Search for rooms using the search bar above"}
                     </p>
                     {searchParams.search !== "" && (
                        <Button
                           variant="primary"
                           onClick={() => {
                              setSearchParams({
                                 search: "",
                                 minPrice: "",
                                 maxPrice: "",
                                 bedType: "",
                              });
                              navigate("/room-types");
                           }}
                        >
                           Clear Search
                        </Button>
                     )}
                  </div>
               )}

               {/* No response */}
               {!isLoading && searchResults?.roomTypes.length === undefined && (
                  <div className={styles.noResults}>
                     <div className={styles.noResults__icon}>🏨</div>
                     <h3 className={styles.noResults__title}>No rooms found</h3>
                     <p className={styles.noResults__message}>
                        {searchParams.search !== ""
                           ? "Try adjusting your search criteria"
                           : "Search for rooms using the search bar above"}
                     </p>
                     {searchParams.search !== "" && (
                        <Button
                           variant="primary"
                           onClick={() => {
                              setSearchParams({
                                 search: "",
                                 minPrice: "",
                                 maxPrice: "",
                                 bedType: "",
                              });
                              navigate("/room-types");
                           }}
                        >
                           Clear Search
                        </Button>
                     )}
                  </div>
               )}
            </main>
         </div>
      </div>
   );
};

export default RoomSearch;
