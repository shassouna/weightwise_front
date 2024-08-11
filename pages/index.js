// pages/exercises.js
import React from "react";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import * as jwt from "jwt-decode";

const Accueil = ({ token }) => {
  const router = useRouter();

  const hadleAddWorkout = () => {
    router.push("/add-session");
  };
  const handleShowWorkout = () => {
    if (token.id) {
      router.push(`/users/${token.id}`);
    } else {
      router.push("/login");
    }
  };
  return (
    <div className="container position-absolute top-50 start-50 translate-middle">
      <div className="row d-flex justify-content-center">
        <button
          className="btn btn-dark m-3 p-4 col-10 col-md-8 col-lg-4"
          type="button"
          onClick={hadleAddWorkout}
        >
          Enregistrer Entrainement
        </button>
      </div>
      <div className="row d-flex justify-content-center">
        <button
          className="btn btn-dark m-3 p-4 col-10 col-md-8 col-lg-4"
          type="button"
          onClick={handleShowWorkout}
        >
          Voir mes Entrainements
        </button>
      </div>
    </div>
  );
};

export default Accueil;

const verifyToken = (token) => {
  try {
    const decoded = jwt.jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp > now) {
      return decoded;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

export async function getServerSideProps(context) {
  const { token } = parseCookies(context);
  return {
    props: {
      token: verifyToken(token),
    },
  };
}
