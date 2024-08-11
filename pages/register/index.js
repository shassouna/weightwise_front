import React, { useState } from "react";
import Modal from "../../components/Popup";
import { useRouter } from "next/router";
import axios from "axios";
import { parseCookies } from "nookies";
import * as jwt from "jwt-decode";

function Register() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Close Modal function
  const closeModal = () => {
    setIsModalOpen(false);
    router.push("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/auth/local/register`,
        {
          username: username,
          email: email,
          password: password,
        }
      );
      router.push("/login");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(
          "Erreur lors de l'inscription : " + error.response.data.message
        );
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <br />
      <form style={{ minWidth: "370px" }} onSubmit={handleSubmit}>
        <div tabIndex="-1" role="dialog">
          <div role="document">
            <div className="modal-body">
              <div className="m-3">
                <input
                  className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                  type="text"
                  placeholder="Nom"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
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
                <button type="submit" className="btn btn-dark w-50 ">
                  S'inscrire
                </button>
              </div>
              {error && <p className="text-danger text-center"> {error}</p>}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default Register;

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
