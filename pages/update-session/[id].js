import { useState } from "react";
import axios from "axios";
import qs from "qs";
import DeleteWeight from "@/components/DeleteWeight";
import SuccessMessage from "@/components/SuccessMessage";

const today = new Date();
const todayString = today.toISOString().split("T")[0];

const AddWeightPage = (props) => {
  // useStates

  const [session, SetSession] = useState(props.session);
  const [weights, setWeights] = useState(props.weights);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [alreadyExist, setAlreadyExist] = useState(null);
  const [selectedWeightToDelete, setSelectedWeightToDelete] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // add weight entry
  const handleAddEntry = () => {
    setWeights([
      ...weights,
      { weight: "", sets: "", reps: "", exercise: "", workout_session: "" },
    ]);
  };

  const handleDeleteEntry = (index, id) => {
    if (!id) {
      setWeights(weights.filter((e) => weights.indexOf(e) !== index));
      return;
    }
    setSelectedIndex(index);
    setSelectedWeightToDelete(id);
    setIsModalOpen(true);
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
      // update session
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/workout-sessions/${session.id}`,
        {
          data: {
            date: session.date,
            description: session.description,
            users_permissions_user: parseInt(session.user),
          },
        }
      );
      // update weights
      for (const weight of weights) {
        if (weight.id) {
          await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/weight-entries/${weight.id}`,
            {
              data: {
                weight: parseFloat(weight.weight),
                sets: parseInt(weight.sets),
                reps: parseInt(weight.reps),
                exercise: parseInt(weight.exercise),
                muscle_group: parseInt(weight.muscle_group),
                workout_session: session.id,
              },
            }
          );
        } else {
          await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/weight-entries`,
            {
              data: {
                weight: parseFloat(weight.weight),
                sets: parseInt(weight.sets),
                reps: parseInt(weight.reps),
                exercise: parseInt(weight.exercise),
                muscle_group: parseInt(weight.muscle_group),
                workout_session: session.id,
              },
            }
          );
        }
      }

      setAlreadyExist(null);
      setError(null);
      setSuccess("mise à jour enregistré avec succès");
    } catch (error) {
      // Display a warning message
      setAlreadyExist(null);
      setSuccess(null);
      setError("Erreur lors de l'enregistrement des données");
    } finally {
      // Restore the weight entry in the database
      setLoading(false);
    }
  };

  return (
    <>
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
                    <h3
                      className="text-center text-dark"
                      style={{ textDecoration: "underline" }}
                    >
                      Les informations sur la séance
                    </h3>
                    <div className="bg-dark m-3 p-3 rounded">
                      <div className="m-2">
                        <label
                          htmlFor="dateInput"
                          className="w-100 p-2 text-warning text-center"
                        >
                          Date de la séance
                        </label>
                        <input
                          style={{ fontWeight: "bold" }}
                          className="form-control w-100 p-2 bg-light text-dark rounded-3 text-center"
                          type="date"
                          defaultValue={session.date}
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
                          style={{ fontWeight: "bold" }}
                          className="form-control w-100 p-2 bg-light text-dark rounded-3 text-center"
                          placeholder="Ajouter des notes"
                          rows="3"
                          value={session.description}
                          onChange={(e) =>
                            handleChangeSession("description", e.target.value)
                          }
                        ></textarea>
                      </div>
                    </div>{" "}
                    <hr />
                  </div>
                  <div>
                    <h3
                      className="text-center text-dark"
                      style={{ textDecoration: "underline" }}
                    >
                      Les Poids
                    </h3>
                    {weights.map((weight, index) => (
                      <div key={weight.id} className="m-3 p-3 bg-dark rounded">
                        <div
                          type="button"
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Suprimer ce poids"
                          className="fs-3 text-danger text-end"
                          onClick={() => handleDeleteEntry(index, weight.id)}
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
                            style={{ fontWeight: "bold" }}
                            id="muscleGroupInput"
                            className="form-control w-100 p-2 bg-light text-dark rounded-3 text-center"
                            value={weight.muscle_group}
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
                            {props.muscle_groups.map((mg) => (
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
                            style={{ fontWeight: "bold" }}
                            id="exerciseInput"
                            className="form-control w-100 p-2 bg-light text-dark rounded-3 text-center"
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
                            {props.exercises.map((ex) => (
                              <option key={ex.id} value={ex.id}>
                                {ex.attributes.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="m-3 text-center">
                          <label
                            htmlFor="weightInput"
                            className="w-100 p-2 text-warning text-center"
                          >
                            Poids
                          </label>
                          <input
                            style={{ fontWeight: "bold" }}
                            className="form-control w-100 p-2 bg-light text-dark rounded-3 text-center"
                            type="number"
                            min="1"
                            max="300"
                            placeholder="Poids kg"
                            value={weight.weight}
                            onChange={(e) =>
                              handleChangeWeights(
                                index,
                                "weight",
                                e.target.value
                              )
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
                            style={{ fontWeight: "bold" }}
                            id="NombreDeSeriesInput"
                            className="form-control w-100 p-2 bg-light text-dark rounded-3 text-center"
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
                            style={{ fontWeight: "bold" }}
                            id="NombreDeRepetitionInput"
                            className="form-control w-100 p-2 bg-light text-dark rounded-3 text-center"
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
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Cliquer pour ajouter un autre poids"
                        className="fs-1 text-success"
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
                      data-toggle="tooltip"
                      data-placement="top"
                      title="Mettre à jour la séance"
                      type="submit"
                      disabled={false}
                    >
                      Enregistrer
                    </button>
                  ) : (
                    <button
                      className="btn btn-success fs-4"
                      data-toggle="tooltip"
                      data-placement="top"
                      title="Mettre à jour la séance"
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
                    {alreadyExist && (
                      <p style={{ color: "orange" }}>{alreadyExist}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      {selectedIndex != null && selectedWeightToDelete != null && (
        <DeleteWeight
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          id={selectedWeightToDelete}
          setSelectedWeightToDelete={setSelectedWeightToDelete}
          weights={weights}
          setWeights={setWeights}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      )}
      {success && <SuccessMessage text={success} />}
    </>
  );
};

export default AddWeightPage;

export async function getServerSideProps(context) {
  const querySessions = qs.stringify({
    populate: ["weight_entries.exercise", "weight_entries.muscle_group"],
  });

  try {
    const responseExercises = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/exercises`
    );
    const responseMuscle_groups = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/muscle-groups`
    );
    const responseSession = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/workout-sessions/${context.params.id}?${querySessions}`
    );

    const weights =
      responseSession.data.data.attributes.weight_entries.data.map((weight) => {
        return {
          id: weight.id,
          weight: weight.attributes.weight,
          sets: weight.attributes.sets,
          reps: weight.attributes.reps,
          muscle_group: weight.attributes.muscle_group.data.id,
          exercise: weight.attributes.exercise.data.id,
          workout_session: responseSession.data.data.id,
        };
      });

    return {
      props: {
        session: {
          user: 1,
          id: responseSession.data.data.id,
          date: responseSession.data.data.attributes.date,
          description: responseSession.data.data.attributes.description,
        },
        weights: weights,
        exercises: responseExercises.data.data,
        muscle_groups: responseMuscle_groups.data.data,
      },
    };
  } catch (error) {
    return {
      props: {
        user: null,
        session: null,
        weights: [],
        exercises: [],
        muscle_groups: [],
      },
    };
  }
}
