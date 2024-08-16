import { useState, useEffect } from "react";
import axios from "axios";
import qs from "qs";
import { parseCookies } from "nookies";
import * as jwt from "jwt-decode";
import { useRouter } from "next/router";

const SessionPage = (props) => {
  const route = useRouter();

  const [transformDate, setTransformedDate] = useState("");
  const [muscleGroups, setMuscleGroups] = useState([]);

  useEffect(() => {
    const transformDate = (dateString) => {
      // Séparer les différentes parties de la date
      const [year, month, day] = dateString.split("-");

      // Réarranger les parties pour obtenir le format JJ/MM/AAAA
      return `${day}/${month}/${year}`;
    };
    const getUniqueMuscleGroups = (weights) => {
      const tab = weights.map(
        (weight) => weight.attributes.muscle_group.data.attributes.name
      );
      setMuscleGroups([...new Set(tab)]);
    };

    setTransformedDate(transformDate(props.session.date));
    getUniqueMuscleGroups(props.weights);
  }, [props.session.date, props.weights]);

  const handleUpdateWorkout = () => {
    route.push(`/update-session/${props.session.id}`);
  };

  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center">
        <form className="w-100 p-3 m-3 rounded table-responsive">
          <table className="table table-striped align-middle caption-top">
            <caption className="mb-4">
              <span scope="col" className="h4">
                Date de la séance : {transformDate}
              </span>
            </caption>
            <caption className="mb-4">
              <span scope="col" className="h4">
                Groupes musculaires :
                {muscleGroups.map((muscle, index) => (
                  <span>
                    {index === muscleGroups.length - 1
                      ? muscle
                      : " " + muscle + ", "}
                  </span>
                ))}
              </span>
            </caption>
            {props.session.description && (
              <caption className="mb-4">
                <span scope="col" className="h4">
                  Notes : {props.session.description}
                </span>
              </caption>
            )}

            <thead>
              <tr>
                <th scope="col"></th>
                <th className="text-center">Poids (kg)</th>
                <th scope="col" className="text-center">
                  Nombre de series
                </th>
                <th scope="col" className="text-center">
                  Nombre de Répétitions
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {props.weights.map((weight) => (
                <tr key={weight.id}>
                  <th scope="row" className="text-center">
                    {weight.attributes.exercise.data.attributes.name}
                  </th>
                  <td className="text-center">{weight.attributes.weight}</td>
                  <td className="text-center">{weight.attributes.sets}</td>
                  <td className="text-center">{weight.attributes.reps}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <br />
          <div className="row d-flex justify-content-center">
            <button
              className="btn btn-dark m-3 p-4 col-6 col-md-6 col-lg-2"
              type="button"
              onClick={handleUpdateWorkout}
            >
              Modifier Entrainement
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SessionPage;

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
    const querySession = qs.stringify({
      populate: ["weight_entries.exercise", "weight_entries.muscle_group"],
    });
    const responseSession = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/workout-sessions/${context.params.id}?${querySession}`
    );

    return {
      props: {
        session: {
          id: responseSession.data.data.id,
          date: responseSession.data.data.attributes.date,

          description: responseSession.data.data.attributes.description,
        },
        weights: responseSession.data.data.attributes.weight_entries.data,
        muscle_groups: [],
      },
    };
  } catch (error) {
    return {
      props: {
        session: null,
        weights: [],
        muscle_groups: [],
      },
    };
  }
}
