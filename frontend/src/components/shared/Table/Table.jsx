import React from "react";
import PropTypes from "prop-types";
import styles from "./Table.module.css";

const Table = ({ columns, data, onRowClick, className }) => {
   // Handle row click
   const handleRowClick = (row, e) => {
      // Don't trigger row click if clicking on a link or button
      if (e.target.tagName === "A" || e.target.tagName === "BUTTON") {
         return;
      }

      if (onRowClick && row) {
         onRowClick(row);
      }
   };

   // Render cell content
   const renderCell = (row, column) => {
      if (column.render) {
         return column.render(row);
      }

      // Default render: get value from row by column key
      const value = row[column.key];

      // Format based on type
      if (value === null || value === undefined) {
         return "-";
      }

      if (typeof value === "boolean") {
         return value ? "Yes" : "No";
      }

      return value;
   };

   return (
      <div className={`${styles.tableWrapper} ${className || ""}`}>
         <table className={styles.table}>
            <thead>
               <tr>
                  {columns.map((column) => (
                     <th key={column.key} className={styles.tableHeader}>
                        {column.header}
                     </th>
                  ))}
               </tr>
            </thead>
            <tbody>
               {data?.length === 0 ? (
                  <tr>
                     <td colSpan={columns.length} className={styles.tableEmpty}>
                        No data available
                     </td>
                  </tr>
               ) : (
                  data?.map((row, index) => (
                     <tr
                        key={row.id || index}
                        className={`${styles.tableRow} ${
                           onRowClick ? styles.clickableRow : ""
                        }`}
                        onClick={(e) => handleRowClick(row, e)}
                     >
                        {columns.map((column) => (
                           <td key={column.key} className={styles.tableCell}>
                              {renderCell(row, column)}
                           </td>
                        ))}
                     </tr>
                  ))
               )}
            </tbody>
         </table>
      </div>
   );
};

Table.propTypes = {
   columns: PropTypes.arrayOf(
      PropTypes.shape({
         key: PropTypes.string.isRequired,
         header: PropTypes.string.isRequired,
         render: PropTypes.func,
      })
   ).isRequired,
   data: PropTypes.array.isRequired,
   onRowClick: PropTypes.func,
   className: PropTypes.string,
};

export default Table;
