import Modal from "./Popup";
import { useRouter } from "next/router";

const AddSession = ({
  isModalOpen,
  setIsModalOpen,
  error,
  success,
  alreadyExist,
  sessionId,
}) => {
  console.log(sessionId);
  const router = useRouter();

  // close Modal function
  const closeModal = () => {
    setIsModalOpen(false);
    router.push("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    router.push("/");
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <form onSubmit={handleSubmit}>
        <div tabIndex="-1" role="dialog">
          <div role="document">
            <div className="modal-body">
              {success && (
                <>
                  <p className="fs-5">{success}</p>
                  <button type="submit" className="btn btn-success">
                    Ok
                  </button>
                </>
              )}

              {error && (
                <>
                  <p className="fs-5">{error}</p>
                  <button type="submit" className="btn btn-danger">
                    Ok
                  </button>
                </>
              )}
              {alreadyExist && (
                <>
                  <p className="fs-5">{alreadyExist}</p>
                  <button type="submit" className="btn btn-warning">
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

export default AddSession;
