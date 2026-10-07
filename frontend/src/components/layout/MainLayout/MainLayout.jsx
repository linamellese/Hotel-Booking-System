import { Outlet } from "react-router-dom";
import Navbar from "../../shared/Navbar/Navbar";
import styles from "./MainLayout.module.css";
import Footer from "../../shared/Footer/Footer";

const MainLayout = () => {
   return (
      <div className={styles.layout}>
         <Navbar />
         <main className={`${styles.main} py-8`}>
            <Outlet />
         </main>
         <Footer />
      </div>
   );
};

export default MainLayout;
