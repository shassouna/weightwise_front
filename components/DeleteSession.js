import { useState } from "react";
import Modal from "./Popup";
import { useRouter } from "next/router";

const DeleteWeightPage = ({ isModalOpen, setIsModalOpen, id }) => {
  const router = useRouter();

  // close Modal function
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    router.push(`/delete-session/${id}`);
  };
  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <form onSubmit={handleSubmit}>
        <div tabIndex="-1" role="dialog">
          <div role="document">
            <div className="modal-body">
              <>
                <p className="fs-5">
                  Voulez vous vraiment supprimer la session.
                </p>
                <button type="submit" className="btn btn-danger">
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

export default DeleteWeightPage;
