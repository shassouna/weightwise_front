import { useState } from "react";
import Modal from "./Popup";
import { useRouter } from "next/router";
import axios from "axios";
const DeleteWeight = ({
  id,
  setSelectedWeightToDelete,
  weights,
  setWeights,
  selectedIndex,
  setSelectedIndex,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // close Modal function
  const closeModal = () => {
    setSelectedIndex(null);
    setSelectedWeightToDelete(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/weight-entries/${id}`
      );
      setWeights(weights.filter((e) => weights.indexOf(e) != selectedIndex));
      setSuccess("poids supprimé avec succès");
    } catch (error) {
      setError("Erreur lors de la suppression du poids");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <form
        onSubmit={handleSubmit}
        className="w-100 row p-3 d-flex flex-column justify-content-center align-items-center"
      >
        <div tabIndex="-1" role="dialog">
          <div role="document">
            <div className="modal-body">
              {error == null && success == null && !loading && (
                <>
                  <p className="fs-5">
                    Voulez vous vraiment supprimer le poids.
                  </p>
                  {!loading ? (
                    <button
                      className="btn btn-dark fs-4"
                      type="submit"
                      disabled={false}
                    >
                      Supprimer
                    </button>
                  ) : (
                    <button
                      className="btn btn-dark fs-4"
                      type="submit"
                      disabled
                    >
                      <span role="status mr-2">suppression...</span>
                      <span
                        class="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                    </button>
                  )}
                </>
              )}
              {error && (
                <>
                  <p className="fs-5 text-danger">{error}</p>
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

export default DeleteWeight;
