// components/Popup.js
import React from "react";
import styles from "./Popup.module.css";
import { useRouter } from "next/router";
const Popup = ({ isOpen, onClose, children, login }) => {
  if (!isOpen) return null;

  const route = useRouter();

  /* const handleRedirect = (url) => {
    route.push(url);
  };*/

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={styles.overlay + " " + "modal"}>
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={handleClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Popup;
