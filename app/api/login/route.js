import { adminDb } from "../../lib/firebase-admin";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const { uid } = await req.json();
    if (!uid) throw new Error("UID requerido");

    // Buscar en Firestore
    const userDoc = await adminDb.collection("usuariosMesa").doc(uid).get();
    if (!userDoc.exists) throw new Error("Usuario no encontrado");

    const userData = userDoc.data();

    // Firmar token
    const token = jwt.sign(
      {
        uid,
        adminGeneral: userData.adminGeneral || false,
        mesa: userData.mesa || null,
      },
      SECRET,
      { expiresIn: "8h" }
    );

    // Respuesta con cookie
    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
    });

    response.headers.set(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 8 * 60 * 60,
      })
    );

    return response;
  } catch (err) {
    console.error("Error login API:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 401 }
    );
  }
}
