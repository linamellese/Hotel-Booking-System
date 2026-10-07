import React from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/shared/Button/Button";
import styles from "./PageNotFound.module.css";

const PageNotFound = () => {
   return (
      <div className={styles.notFound}>
         <div className={styles.notFound__container}>
            <div className={styles.notFound__content}>
               <div className={styles.notFound__errorCode}>
                  <span className={styles.notFound__number}>4</span>
                  <span className={styles.notFound__icon}>🔍</span>
                  <span className={styles.notFound__number}>4</span>
               </div>

               <h1 className={styles.notFound__title}>Page Not Found</h1>

               <p className={styles.notFound__message}>
                  We can't seem to find the page you're looking for.
               </p>

               <div className={styles.notFound__actions}>
                  <Link to="/">
                     <Button variant="primary">← Back to Home</Button>
                  </Link>
               </div>

               <div className={styles.notFound__help}>
                  <p>Here are some helpful links instead:</p>
                  <div className={styles.notFound__links}>
                     <Link to="/room-types">Find Rooms</Link>
                     <Link to="/contact">Contact Us</Link>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PageNotFound;
