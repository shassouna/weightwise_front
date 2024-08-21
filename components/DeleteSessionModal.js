import Modal from "./Popup";
import { useRouter } from "next/router";

const DeleteWeightModal = ({ isModalOpen, setIsModalOpen, id }) => {
  const router = useRouter();

  // close Modal function
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = () => {
    setIsModalOpen(false);
    router.push(`/delete-session/${id}`);
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <form onSubmit={closeModal}>
        <div tabIndex="-1" role="dialog">
          <div role="document">
            <div className="modal-body">
              <>
                <p className="fs-5">
                  Voulez vous vraiment supprimer la session.
                </p>
                <button
                  type="submit"
                  className="btn btn-danger"
                  onClick={handleSubmit}
                >
                  Supprimer
                </button>
              </>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default DeleteWeightModal;
