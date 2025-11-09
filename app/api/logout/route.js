import { serialize } from "cookie";

export async function POST() {
  const response = new Response(JSON.stringify({ success: true }), { status: 200 });
  response.headers.set(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    })
  );
  return response;
}
