import { useState } from "react";
import Modal from "../../components/Popup";
import { useRouter } from "next/router";
import axios from "axios";
import qs from "qs";
import { parseCookies } from "nookies";
import * as jwt from "jwt-decode";

const DeleteSessionPage = ({ error, success }) => {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(true);
  // close Modal function
  const closeModal = () => {
    setIsModalOpen(false);
    router.push("/");
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <form>
        <div tabIndex="-1" role="dialog">
          <div role="document">
            <div className="modal-body">
              {error && (
                <>
                  <p className="fs-5 text-danger">{error}</p>{" "}
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={closeModal}
                  >
                    Ok
                  </button>
                </>
              )}
              {success && (
                <>
                  <p className="fs-5 text-success">{success}</p>{" "}
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={closeModal}
                  >
                    Ok
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default DeleteSessionPage;

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

  if (!token || !verifyToken(token)) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const querySession = qs.stringify({
      populate: ["users_permissions_user"],
    });
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/workout-sessions/${context.params.id}?${querySession}`
    );
    const idUser = res.data.data.attributes.users_permissions_user.data.id;
    if (idUser !== verifyToken(token).id) {
      return {
        props: { error: "Erreur lors de la suppression de la séance" },
      };
    }
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/workout-sessions/${context.params.id}`
    );
    return {
      props: { success: "Séance supprimée avec succès" },
    };
  } catch (error) {
    return {
      props: { error: "Erreur lors de la suppression de la séance" },
    };
  }
}
