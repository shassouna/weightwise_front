import { useState } from "react";
import Modal from "./Popup";
import { useRouter } from "next/router";
import axios from "axios";

const SuccessMessage = ({ text }) => {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(true);

  // close Modal function
  const closeModal = () => {
    router.push("/users/1");
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <div tabIndex="-1" role="dialog">
        <div role="document">
          <div className="modal-body">
            <p className="fs-5">{text}</p>
            <button
              type="button"
              className="btn btn-success"
              onClick={closeModal}
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessMessage;
