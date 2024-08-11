// components/Footer.js
import Link from "next/link";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* <div className={styles.container}>
        <div className={styles.section}>
          <h4>Navigation</h4>
          <ul className={styles.list}>
            <li>
              <Link href="/" className={styles.link}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className={styles.link}>
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className={styles.link}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.section}>
          <h4>Suivez-nous</h4>
          <ul className={styles.list}>
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                className={styles.link}
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                className={styles.link}
              >
                Twitter
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                className={styles.link}
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
        <div className={styles.section}>
          <h4>Contact</h4>
          <p className={styles.text}>123 Rue Exemple, Ville, Pays</p>
          <p className={styles.text}>Email: info@exemple.com</p>
          <p className={styles.text}>Téléphone: +123 456 7890</p>
        </div>
      </div>*/}
      <div className={styles.copyright}>
        <p>
          &copy; {new Date().getFullYear()} Mon Application. Tous droits
          réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
