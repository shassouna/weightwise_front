import { useState } from "react";
import axios from "axios";
import qs from "qs";
import { parseCookies } from "nookies";
import * as jwt from "jwt-decode";
import AddSession from "@/components/AddSession";

const today = new Date();
const todayString = today.toISOString().split("T")[0];

const AddWeightPage = ({ exercises, muscle_groups, token }) => {
  // useStates
  const [session, SetSession] = useState({
    date: todayString,
    description: "",
  });
  const [weights, setWeights] = useState([
    {
      weight: "",
      sets: "",
      reps: "",
      muscle_group: "",
      exercise: "",
      workout_session: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [alreadyExist, setAlreadyExist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // add weight entry
  const handleAddEntry = () => {
    setWeights([
      ...weights,
      { weight: "", sets: "", reps: "", exercise: "", workout_session: "" },
    ]);
  };

  const handleDeleteEntry = (index) => {
    setWeights(weights.filter((e) => weights.indexOf(e) != index));
  };

  // update weights information from form
  const handleChangeWeights = (index, field, value) => {
    setError(null);
    setSuccess(null);
    setAlreadyExist(null);
    const newWeights = [...weights];
    newWeights[index][field] = value;
    setWeights(newWeights);
  };

  // update weight and session and user information from form
  const handleChangeSession = (field, value) => {
    setError(null);
    setSuccess(null);
    setAlreadyExist(null);
    const newSession = { ...session };
    newSession[field] = value;
    SetSession(newSession);
  };

  // post new session entry to database function
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // vars
      let sessionId = null;

      // Query to get sessions for the user on the given date, filtered by the user's permissions and the provided session date
      const querySessions = qs.stringify({
        filters: {
          date: { $eq: session.date },
          users_permissions_user: { $eq: token.id },
        },
      });

      // Check if session already exists for the user on the given date
      const checkSessionRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/workout-sessions?${querySessions}`
      );
      // If session exists, get its id, else create a new session for the user on the given date
      if (checkSessionRes.data.data.length > 0) {
        sessionId = checkSessionRes.data.data[0].id;
      } else {
        // Create a new session for the user on the given date with the provided description
        const addSessionRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/workout-sessions`,
          {
            data: {
              date: session.date,
              description: session.description,
              users_permissions_user: token.id,
            },
          }
        );
        sessionId = addSessionRes.data.data.id;
      }

      // Save the weight entry in the database
      for (const weight of weights) {
        // Filter weight entries to check if a similar entry already exists
        const queryWeights = qs.stringify({
          filters: {
            weight: parseFloat(weight.weight),
            sets: parseInt(weight.sets),
            reps: parseInt(weight.reps),
            exercise: parseInt(weight.exercise),
            muscle_group: parseInt(weight.muscle_group),
            workout_session: sessionId,
          },
        });
        // Get the weight entries for the given session and muscle group, exercise, weight, sets, and reps from the database
        const weight_entriesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/weight-entries?${queryWeights}`
        );
        // If a similar entry exists, display a success message and return
        if (weight_entriesRes.data.data.length > 0) {
          setError(null);
          setSuccess(null);
          setAlreadyExist(
            "Cette entrée de poids existe déjà pour cette session"
          );
          return;
        }
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/weight-entries`,
          {
            data: {
              weight: parseFloat(weight.weight),
              sets: parseInt(weight.sets),
              reps: parseInt(weight.reps),
              exercise: parseInt(weight.exercise),
              muscle_group: parseInt(weight.muscle_group),
              workout_session: sessionId,
            },
          }
        );
      }
      // Display a success message when the weight entry is saved successfully
      setAlreadyExist(null);
      setError(null);
      setSuccess("Poids enregistrés avec succès");
    } catch (error) {
      // Display a warning message
      setAlreadyExist(null);
      setSuccess(null);
      setError("Erreur lors de l'enregistrement des données");
    } finally {
      // Restore the weight entry in the database
      setLoading(false);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <form
        onSubmit={handleSubmit}
        className="w-75 p-3 m-3 rounded"
        style={{
          background: "rgba(240,240,240,0.3)",
          maxWidth: "800px",
          minWidth: "400px",
        }}
      >
        <div>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-body">
                <div className="mb-5">
                  <h3 className="text-center text-dark">
                    Les informations sur la séance
                  </h3>
                  <hr />
                  <div className="bg-dark m-3 p-3 rounded">
                    <div className="m-2">
                      <label
                        htmlFor="dateInput"
                        className="w-100 p-2 text-warning text-center"
                      >
                        Date de la séance
                      </label>
                      <input
                        className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                        type="date"
                        defaultValue={todayString}
                        max={todayString}
                        onChange={(e) =>
                          handleChangeSession("date", e.target.value)
                        }
                      />
                    </div>
                    <div className="m-2">
                      <label
                        htmlFor="descriptionInput"
                        className="w-100 p-2 text-warning text-center"
                      >
                        Description
                      </label>
                      <textarea
                        className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                        placeholder="Ajouter des notes"
                        rows="3"
                        value={session.description}
                        onChange={(e) =>
                          handleChangeSession("description", e.target.value)
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-center text-dark">Les Poids</h3>
                  <hr />
                  {weights.map((weight, index) => (
                    <div className="m-3 p-3 bg-dark rounded" key={index}>
                      <div
                        type="button"
                        className="fs-3 text-danger text-end"
                        onClick={() => handleDeleteEntry(index)}
                      >
                        x
                      </div>
                      <h5 className="text-center text-white">
                        Poids {index + 1}{" "}
                      </h5>
                      <div className="form-group m-3">
                        <label
                          htmlFor="muscleGroupInput"
                          className="w-100 p-2 text-warning text-center"
                        >
                          Groupe musculaire
                        </label>
                        <select
                          className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                          value={weight.muscle_groupe}
                          onChange={(e) =>
                            handleChangeWeights(
                              index,
                              "muscle_group",
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">
                            Sélectionnez un groupe musculaire
                          </option>
                          {muscle_groups.map((mg) => (
                            <option key={mg.id} value={mg.id}>
                              {mg.attributes.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group m-3">
                        <label
                          htmlFor="exerciseInput"
                          className="w-100 p-2 text-warning text-center"
                        >
                          Exercise
                        </label>
                        <select
                          className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                          value={weight.exercise}
                          onChange={(e) =>
                            handleChangeWeights(
                              index,
                              "exercise",
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">Sélectionnez un exercice</option>
                          {exercises.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                              {ex.attributes.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="m-3">
                        <label
                          htmlFor="weightInput"
                          className="w-100 p-2 text-warning text-center"
                        >
                          Poids
                        </label>
                        <input
                          className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                          type="number"
                          min="1"
                          max="300"
                          placeholder="Poids kg"
                          value={weight.weight}
                          onChange={(e) =>
                            handleChangeWeights(index, "weight", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="m-3">
                        <label
                          htmlFor="NombreDeSeriesInput"
                          className="w-100 p-2 text-warning text-center"
                        >
                          Nombre de Séries
                        </label>
                        <input
                          className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                          type="number"
                          min="1"
                          max="25"
                          placeholder="Nombre de Séries"
                          value={weight.sets}
                          onChange={(e) =>
                            handleChangeWeights(index, "sets", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="m-3">
                        <label
                          htmlFor="NombreDeRepetitionInput"
                          className="w-100 p-2 text-warning text-center"
                        >
                          Nombre de Répétitions
                        </label>
                        <input
                          className="form-control w-100 p-2 fs-6 bg-light text-secondary rounded-3 text-center"
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Nombre de Répétitions"
                          value={weight.reps}
                          onChange={(e) =>
                            handleChangeWeights(index, "reps", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <div className="w-100 text-center">
                    <div
                      type="button"
                      className="fs-1 text-dark"
                      onClick={handleAddEntry}
                    >
                      +
                    </div>
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
                    Enregistrer
                  </button>
                ) : (
                  <button
                    className="btn btn-success fs-4"
                    type="submit"
                    disabled
                  >
                    <span role="status mr-2">Enregistrement...</span>
                    <span
                      class="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                  </button>
                )}

                <div className="mt-4 text-center">
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  {success && <p style={{ color: "green" }}>{success}</p>}
                  {alreadyExist && (
                    <p style={{ color: "orange" }}>{alreadyExist}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <AddSession
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        success={success}
        error={error}
        alreadyExist={alreadyExist}
      />
    </div>
  );
};

export default AddWeightPage;

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
    const responseExercises = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/exercises`
    );
    const responseMuscle_groups = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/muscle-groups`
    );
    return {
      props: {
        exercises: responseExercises.data.data,
        muscle_groups: responseMuscle_groups.data.data,
        token: verifyToken(token),
      },
    };
  } catch (error) {
    return {
      props: {
        exercises: [],
        muscle_groups: [],
        token: verifyToken(token),
      },
    };
  }
}
