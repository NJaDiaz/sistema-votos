import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie) throw new Error("No token");

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) throw new Error("No token");

    const payload = jwt.verify(token, SECRET);

    return new Response(
      JSON.stringify({
        uid: payload.uid,
        adminGeneral: payload.adminGeneral,
        mesa: payload.mesa,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: err.message }),
      { status: 401 }
    );
  }
}
