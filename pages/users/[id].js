// pages/users/[id].js
import { useState } from "react";
import axios from "axios";
import qs from "qs";
import DeleteSession from "../../components/DeleteSession";
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

const getUniqueExercisesEntries = (entries) => {
  const uniqueEntries = [];
  const seen = new Set();

  entries.forEach((entry) => {
    if (!seen.has(entry.exercise.name)) {
      uniqueEntries.push(entry);
      seen.add(entry.exercise.name);
    }
  });

  return uniqueEntries;
};

const UserPage = ({ workout_sessions }) => {
  const router = useRouter();

  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateWeight = (id) => {
    router.push("/update-session/" + id);
  };
  const handleDeleteWeight = (id) => {
    setSelectedSessionId(id);
    setIsModalOpen(true);
  };
  const handleLinktoAddSession = () => {
    router.push("/add-session/");
  };

  return (
    <>
      <div
        className="d-flex flex-column justify-content-center align-items-center m-5"
        style={{ minHeight: "500px" }}
      >
        {workout_sessions.length > 0 ? (
          <table className="table w-75" style={{ minWidth: "400px" }}>
            <thead>
              <tr>
                <th scope="col" className="text-start">
                  Date
                </th>
                <th scope="col" className="text-start">
                  Muscles
                </th>
                <th scope="col" className="text-start">
                  Exercises
                </th>
              </tr>
            </thead>
            <tbody>
              {workout_sessions.map((workout) => {
                // Obtenir des entrées de poids uniques pour chaque session
                const uniqueWeightEntries = getUniqueWeightEntries(
                  workout.weight_entries
                );
                const uniqueExercisesEntries = getUniqueExercisesEntries(
                  workout.weight_entries
                );

                return (
                  <tr key={workout.id} className="table-light">
                    <td scope="row" className="text-start">
                      {workout.date}
                    </td>
                    <td className="text-start">
                      {uniqueWeightEntries.map((weight, index) => (
                        <div key={weight.id} className="list-unstyled">
                          {weight.muscle_group.name}
                        </div>
                      ))}
                    </td>
                    <td className="text-start">
                      {uniqueExercisesEntries.map((weight) => (
                        <div key={weight.id}>
                          {weight.exercise.name}
                          <br />
                        </div>
                      ))}
                    </td>
                    <td className="text-end">
                      <button type="button" className="btn btn-dark m-1">
                        Details...
                      </button>
                      <button
                        type="button"
                        className="btn btn-success m-1"
                        onClick={() => handleUpdateWeight(workout.id)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger m-1"
                        onClick={() => handleDeleteWeight(workout.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <p className="h3 text-center">Pas d'entrainements enregistrés</p>
            <br />
            <button
              type="button"
              className="btn btn-dark"
              onClick={handleLinktoAddSession}
            >
              Enregistrer entrainement
            </button>
          </div>
        )}
      </div>
      {selectedSessionId && (
        <DeleteSession
          id={selectedSessionId}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
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
        workout_sessions: user.workout_sessions,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l’utilisateur:", error);
    return {
      props: { user: null },
    };
  }
}

export default UserPage;
