import React, { useState } from "react";
import Modal from "../../components/Popup";
import { useRouter } from "next/router";
import axios from "axios";
import Cookies from "js-cookie";
import { parseCookies } from "nookies";
import * as jwt from "jwt-decode";

function Login() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Close Modal function
  const closeModal = () => {
    router.push("/");
    setIsModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/auth/local/`,
        {
          identifier: email,
          password: password,
        }
      );
      setTimeout(() => {}, 2000);
      Cookies.set("token", res.data.jwt, { expires: 7, path: "" });
      router.push("/");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(
          "Erreur lors de la connexion : " + error.response.data.message
        );
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <form style={{ minWidth: "370px" }} onSubmit={handleSubmit}>
        <br />
        <div tabIndex="-1" role="dialog">
          <div role="document">
            <div className="modal-body">
              <div className="m-3">
                <input
                  className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="m-3">
                <input
                  className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                  type="password"
                  placeholder="Mdp"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <br />
              <div className="m-3 d-flex justify-content-center">
                {!loading ? (
                  <button
                    className="btn btn-dark w-50"
                    type="submit"
                    disabled={false}
                  >
                    Se connecter
                  </button>
                ) : (
                  <button className="btn btn-dark w-50" type="submit" disabled>
                    <span role="status mr-2">Connexion...</span>
                    <span
                      class="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                  </button>
                )}
              </div>
              {error && <p className="text-danger text-center"> {error}</p>}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default Login;

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

  if (token && verifyToken(token)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  try {
    return {
      props: {},
    };
  } catch (error) {
    return {
      props: {},
    };
  }
}
