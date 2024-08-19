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
        <nav className={styles.navLogo}>
          <Link href="/" className={styles.navImgLink}>
            <img src="/main-logo-transparent.svg" alt="Logo" width="100%" />
          </Link>
        </nav>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
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
            {!isLoggedIn ? (
              <>
                <li className={styles.li}>
                  <Link
                    href={"/register"}
                    className={styles.navLink}
                    style={{ color: "green" }}
                  >
                    Inscription
                  </Link>
                </li>
                <li className={styles.li}>
                  <Link
                    href="/login"
                    className={styles.navLink}
                    style={{ color: "green" }}
                  >
                    Connexion
                  </Link>
                </li>
              </>
            ) : (
              <li onClick={handleSignOut} className={styles.li}>
                <Link
                  href="/#"
                  className={styles.navLink}
                  style={{
                    color: "crimson",
                  }}
                >
                  Déconnexion
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {!isMobileMenuOpen ? (
          <img
            src="/open-menu.svg"
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
          ></img>
        ) : (
          <img
            src="/close-menu.svg"
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
          ></img>
        )}

        {isMobileMenuOpen && (
          <nav className={styles.mobileNav}>
            <ul className={styles.mobileNavList}>
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
              {!isLoggedIn ? (
                <>
                  <li className={styles.li}>
                    <Link
                      href={"/register"}
                      className={styles.navLink}
                      style={{ color: "green" }}
                    >
                      Inscription
                    </Link>
                  </li>
                  <li className={styles.li}>
                    <Link
                      href="/login"
                      className={styles.navLink}
                      style={{ color: "green" }}
                    >
                      Connexion
                    </Link>
                  </li>
                </>
              ) : (
                <li onClick={handleSignOut} className={styles.li}>
                  <Link
                    href="/#"
                    className={styles.navLink}
                    style={{ color: "crimson" }}
                  >
                    Déconnexion
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
