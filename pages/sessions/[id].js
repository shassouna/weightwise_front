import axios from "axios";
import qs from "qs";
import { parseCookies } from "nookies";
import * as jwt from "jwt-decode";

const SessionPage = (props) => {
  console.log(props.session);
  return null;
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
      populate: [
        "weight_entries.exercise",
        "weight_entries.muscle_group",
        "users_permissions_user",
      ],
    });
    const responseSession = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL_SERVER}/api/workout-sessions/${context.params.id}?${querySession}`
    );

    return {
      props: {
        session: responseSession.data.data,
      },
    };
  } catch (error) {
    return {
      props: {
        session: null,
      },
    };
  }
}
