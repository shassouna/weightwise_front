// pages/users/[id].js
import { useState } from "react";
import axios from "axios";
import qs from "qs";
import DeleteSessionModal from "../../components/DeleteSessionModal";
import AdvanceSearch from "@/components/AdvanceSearch";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import * as jwt from "jwt-decode";

// Fonction pour supprimer les doublons dans les entrées de poids
const getUniqueWeightEntries = (entries) => {
  const uniqueEntries = [];
  const seen = new Set();

  entries.forEach((entry) => {
    if (!seen.has(entry.muscle_group.name)) {
      uniqueEntries.push(entry);
      seen.add(entry.muscle_group.name);
    }
  });

  return uniqueEntries;
};

const UserPage = ({ user, workout_sessions }) => {
  const router = useRouter();

  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [workoutSessions, setWorkoutSessions] = useState(workout_sessions);

  const handleShowWorkout = (id) => {
    router.push("/sessions/" + id);
  };
  const handleUpdateWorkout = (id) => {
    router.push("/update-session/" + id);
  };
  const handleDeleteWorkout = (id) => {
    setSelectedSessionId(id);
    setIsModalOpen(true);
  };
  const handleLinktoAddSession = () => {
    router.push("/add-session/");
  };

  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center m-2">
        {workoutSessions.length > 0 ? (
          <>
            <div className="d-flex flex-column justify-content-center align-items-center">
              <p className="h3 text-center">
                Pour effectuer une recherche avancée
              </p>
              <br />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsModalOpen2(true)}
              >
                Cliquez ici
              </button>
            </div>
            <br /> <br />
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col" className="fs-5">
                    Date
                  </th>
                  <th scope="col" className="fs-5">
                    Muscles
                  </th>
                </tr>
              </thead>
              <tbody>
                {workoutSessions.map((workout) => {
                  // Obtenir des entrées de poids uniques pour chaque session
                  const uniqueWeightEntries = getUniqueWeightEntries(
                    workout.weight_entries
                  );
                  return (
                    <tr key={workout.id} className="table-light">
                      <td scope="row" className="fs-5">
                        {new Date(workout.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        {uniqueWeightEntries.map((weight) => (
                          <div key={weight.id} className="list-unstyled fs-5">
                            {weight.muscle_group.name}
                          </div>
                        ))}
                      </td>
                      <td>
                        <div className="row d-flex justify-content-end m-1">
                          <button
                            type="button"
                            className="btn btn-dark col-sm-6 col-md-6 col-lg-4"
                            onClick={() => handleShowWorkout(workout.id)}
                          >
                            Details...
                          </button>
                        </div>
                        <div className="row d-flex justify-content-end m-1">
                          <button
                            type="button"
                            className="btn btn-success col-sm-6 col-md-6 col-lg-4"
                            onClick={() => handleUpdateWorkout(workout.id)}
                          >
                            Modifier
                          </button>
                        </div>
                        <div className="row d-flex justify-content-end m-1">
                          <button
                            type="button"
                            className="btn btn-danger col-sm-6 col-md-6 col-lg-4"
                            onClick={() => handleDeleteWorkout(workout.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : workout_sessions.length == 0 ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <p className="h3 text-center">Aucun entraînement enregistré</p>
            <br />
            <button
              type="button"
              className="btn btn-dark"
              onClick={handleLinktoAddSession}
            >
              Enregistrer l'entraînement
            </button>
          </div>
        ) : (
          workout_sessions.length != 0 &&
          workoutSessions.length == 0 && (
            <div className="d-flex flex-column justify-content-center align-items-center">
              <p className="h3 text-center">
                Aucun entraînement avec les critères choisis
              </p>
              <br />
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => setWorkoutSessions(workout_sessions)}
              >
                Réinitialiser
              </button>
            </div>
          )
        )}
      </div>
      {selectedSessionId && (
        <DeleteSessionModal
          id={selectedSessionId}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
      <AdvanceSearch
        userId={user.id}
        isModalOpen={isModalOpen2}
        setIsModalOpen={setIsModalOpen2}
        setWorkoutSessions={setWorkoutSessions}
      />
    </>
  );
};

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

  const id = verifyToken(token).id;

  if (context.params.id != id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const query = qs.stringify({
    populate: [
      "workout_sessions.weight_entries.exercise",
      "workout_sessions.weight_entries.muscle_group",
    ],
  });

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/users/${id}?${query}`
    );
    const user = response.data;

    return {
      props: {
        user: { id: user.id, username: user.username },
        workout_sessions: user.workout_sessions.reverse(),
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l’utilisateur:", error);
    return {
      props: { user: null, workout_sessions: [] },
    };
  }
}

export default UserPage;
