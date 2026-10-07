import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import styles from "./Pagination.module.css";
import classNames from "classnames";
import Button from "../Button/Button";

const Pagination = ({
   currentPage,
   totalPages,
   onPageChange,
   pageSize,
   totalItems,
   showPageSizeOptions = false,
   pageSizeOptions = [10, 25, 50, 100],
   onPageSizeChange,
   className,
   showInfo = true,
}) => {
   if (totalPages <= 1 && !showPageSizeOptions) return null;

   const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
         onPageChange(page);
      }
   };

   const renderPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

      if (endPage - startPage + 1 < maxVisible) {
         startPage = Math.max(1, endPage - maxVisible + 1);
      }

      // First page
      if (startPage > 1) {
         pages.push(
            <Button
               key={1}
               variant="ghost"
               size="small"
               onClick={() => handlePageChange(1)}
               className={styles.pagination__page}
            >
               1
            </Button>
         );
         if (startPage > 2) {
            pages.push(
               <span
                  key="ellipsis-start"
                  className={styles.pagination__ellipsis}
               >
                  <MoreHorizontal size={16} />
               </span>
            );
         }
      }

      // Page numbers
      for (let i = startPage; i <= endPage; i++) {
         pages.push(
            <Button
               key={i}
               variant={currentPage === i ? "primary" : "ghost"}
               size="small"
               onClick={() => handlePageChange(i)}
               className={classNames(
                  styles.pagination__page,
                  currentPage === i && styles["pagination__page--active"]
               )}
            >
               {i}
            </Button>
         );
      }

      // Last page
      if (endPage < totalPages) {
         if (endPage < totalPages - 1) {
            pages.push(
               <span key="ellipsis-end" className={styles.pagination__ellipsis}>
                  <MoreHorizontal size={16} />
               </span>
            );
         }
         pages.push(
            <Button
               key={totalPages}
               variant="ghost"
               size="small"
               onClick={() => handlePageChange(totalPages)}
               className={styles.pagination__page}
            >
               {totalPages}
            </Button>
         );
      }

      return pages;
   };

   const startItem = (currentPage - 1) * pageSize + 1;
   const endItem = Math.min(currentPage * pageSize, totalItems);

   return (
      <div className={classNames(styles.pagination, className)}>
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {showInfo && totalItems > 0 && (
               <div className={styles.pagination__info}>
                  Showing <span className="font-semibold">{startItem}</span> to{" "}
                  <span className="font-semibold">{endItem}</span> of{" "}
                  <span className="font-semibold">{totalItems}</span> results
               </div>
            )}

            <div className="flex items-center gap-2">
               {/* Page size selector */}
               {showPageSizeOptions && (
                  <div className={styles.pagination__pageSize}>
                     <label
                        htmlFor="pageSize"
                        className={styles.pagination__pageSizeLabel}
                     >
                        Show:
                     </label>
                     <select
                        id="pageSize"
                        value={pageSize}
                        onChange={(e) =>
                           onPageSizeChange(Number(e.target.value))
                        }
                        className={styles.pagination__pageSizeSelect}
                     >
                        {pageSizeOptions.map((size) => (
                           <option key={size} value={size}>
                              {size}
                           </option>
                        ))}
                     </select>
                  </div>
               )}

               {/* Navigation buttons */}
               <div className="flex items-center gap-1">
                  <Button
                     variant="ghost"
                     size="small"
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className={styles.pagination__navButton}
                  >
                     <ChevronLeft size={16} />
                     <span className="sr-only">Previous</span>
                  </Button>

                  {renderPageNumbers()}

                  <Button
                     variant="ghost"
                     size="small"
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className={styles.pagination__navButton}
                  >
                     <ChevronRight size={16} />
                     <span className="sr-only">Next</span>
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
};

Pagination.propTypes = {
   currentPage: PropTypes.number.isRequired,
   totalPages: PropTypes.number.isRequired,
   onPageChange: PropTypes.func.isRequired,
   pageSize: PropTypes.number,
   totalItems: PropTypes.number,
   showPageSizeOptions: PropTypes.bool,
   pageSizeOptions: PropTypes.array,
   onPageSizeChange: PropTypes.func,
   className: PropTypes.string,
   showInfo: PropTypes.bool,
};

Pagination.defaultProps = {
   pageSize: 10,
   totalItems: 0,
   pageSizeOptions: [10, 25, 50, 100],
};

export default Pagination;
