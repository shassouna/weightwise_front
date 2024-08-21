import React, { useState, useEffect } from "react";
import axios from "axios";
import qs from "qs";
import Modal from "./Popup";

const today = new Date();
const todayString = today.toISOString().split("T")[0];

function AdvanceSearch({
  isModalOpen,
  setIsModalOpen,
  userId,
  setWorkoutSessions,
}) {
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState(todayString);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const gatMuscleGroups = async () => {
      const responseMuscle_groups = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/muscle-groups`
      );
      setMuscleGroups(responseMuscle_groups.data.data);
    };
    gatMuscleGroups();
  }, []);

  const handleSetMuscleGroups = (e) => {
    if (e.target.checked) {
      setSelectedMuscleGroups((selectedMuscleGroups) => [
        ...selectedMuscleGroups,
        e.target.value,
      ]);
    } else {
      setSelectedMuscleGroups(
        selectedMuscleGroups.filter((group) => group !== e.target.value)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const querySessions = qs.stringify({
        populate: [
          "weight_entries.exercise",
          "weight_entries.muscle_group",
          "users_permissions_user",
        ],
        filters: {
          users_permissions_user: userId,
          weight_entries: {
            muscle_group: { name: { $in: selectedMuscleGroups } },
          },
          date:
            date1 && date2
              ? { $between: [date1, date2] }
              : date1 && !date2
              ? { $gte: date1 }
              : !date1 && date2
              ? { $lte: date2 }
              : { $lte: todayString },
        },
      });
      const responseSessions = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/workout-sessions?${querySessions}`
      );
      const sessionsIds = responseSessions.data.data.map(
        (session) => session.id
      );

      const queryUser = qs.stringify({
        populate: [
          "workout_sessions.weight_entries.exercise",
          "workout_sessions.weight_entries.muscle_group",
        ],
      });

      const responseUser = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/users/${userId}?${queryUser}`
      );
      setDate1("");
      setDate2(todayString);
      setSelectedMuscleGroups([]);
      setIsModalOpen(false);
      setWorkoutSessions(
        responseUser.data.workout_sessions
          .reverse()
          .filter((workout) => sessionsIds.includes(workout.id))
      );
    } catch (err) {
      console.error(err);
      setError("Erreur dans le recherche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <form
        onSubmit={handleSubmit}
        className="rounded"
        style={{
          background: "rgba(240,240,240,0.3)",
          maxWidth: "800px",
          minWidth: "400px",
        }}
      >
        <div tabIndex="-1" role="dialog">
          <div role="ducument">
            <div className="modal-body">
              <div className="mb-5">
                <div className="bg-dark m-3 p-3 rounded">
                  <label className="w-100 p-2 text-warning text-center">
                    Date de la séance
                  </label>
                  <div className="m-2">
                    <label
                      htmlFor="dateInput1"
                      className="w-100 p-2 text-light text-center"
                    >
                      De
                    </label>
                    <input
                      id="dateInput1"
                      className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                      type="date"
                      value={date1}
                      max={todayString}
                      onChange={(e) => setDate1(e.target.value)}
                    />
                    <label
                      htmlFor="dateInput2"
                      className="w-100 p-2 text-light text-center"
                    >
                      à
                    </label>
                    <input
                      id="dateInput2"
                      className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                      type="date"
                      value={date2}
                      max={todayString}
                      onChange={(e) => setDate2(e.target.value)}
                    />
                  </div>
                  <div className="form-group m-3">
                    <label
                      htmlFor="muscleGroupInput"
                      className="w-100 p-2 text-warning text-center"
                    >
                      Groupe musculaire
                    </label>
                    {muscleGroups.map((mg) => (
                      <div className="form-check" key={mg.id}>
                        <input
                          id="flexCheckDefault"
                          className="form-check-input"
                          type="checkbox"
                          value={mg.attributes.name}
                          onChange={handleSetMuscleGroups}
                        ></input>
                        <label
                          className="form-check-label text-light"
                          htmlFor="flexCheckDefault"
                        >
                          {mg.attributes.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center mt-5">
                {!loading ? (
                  <button
                    className="btn btn-success fs-4"
                    type="submit"
                    disabled={false}
                  >
                    Filtrer
                  </button>
                ) : (
                  <button
                    className="btn btn-success fs-4"
                    type="submit"
                    disabled
                  >
                    <span role="status mr-2">Filtrage...</span>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                  </button>
                )}

                <div className="mt-4 text-center">
                  {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default AdvanceSearch;
