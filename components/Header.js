// components/Header.js
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";
import Cookies from "js-cookie";
import * as jwt from "jwt-decode";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwt.jwtDecode(token);
        setUserId(decoded.id);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          setIsLoggedIn(true);
        } else {
          // Token expiré, on le supprime
          Cookies.remove("token");
          setIsLoggedIn(false);
          router.push("/login");
        }
      } catch (error) {
        console.error("Erreur de décodage du token", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [router]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = () => {
    Cookies.remove("token");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div>
          <nav>
            <ul className={styles.navList}>
              {!isLoggedIn && (
                <>
                  <li className={styles.li}>
                    <Link href={"/register"} className={styles.navLink}>
                      S'inscrire
                    </Link>
                  </li>
                  <li className={styles.li}>
                    <Link href="/login" className={styles.navLink}>
                      Se Connecter
                    </Link>
                  </li>
                </>
              )}
              {isLoggedIn && (
                <li onClick={handleSignOut}>
                  <Link href="/#" className={styles.navLink}>
                    Se Deconnecter
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.li}>
              <Link href="/" className={styles.navLink}>
                Accueil
              </Link>
            </li>
            <li className={styles.li}>
              <Link
                href={userId ? `/users/${userId}` : "/login"}
                className={styles.navLink}
              >
                Mes Entrainements
              </Link>
            </li>
            <li className={styles.li}>
              <Link
                href={userId ? `/add-session` : "/login"}
                className={styles.navLink}
              >
                Enregistrer Entrainement
              </Link>
            </li>
          </ul>
        </nav>
        <button className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? "Close Menu" : "Open Menu"}
        </button>
        {isMobileMenuOpen && (
          <nav className={styles.mobileNav}>
            <ul className={styles.mobileNavList}>
              <li className={styles.li}>
                <Link href="/" className={styles.navLink}>
                  Accueil
                </Link>
              </li>
              <li className={styles.li}>
                <Link
                  href={userId ? `/users/${userId}` : "/login"}
                  className={styles.navLink}
                >
                  Mes Entrainements
                </Link>
              </li>
              <li className={styles.li}>
                <Link
                  href={userId ? `/add-session` : "/login"}
                  className={styles.navLink}
                >
                  Enregistrer Entrainement
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
