"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const docRef = doc(db, "usuariosMesa", uid);
      const userSnap = await getDoc(docRef);

      if (!userSnap.exists()) {
        setError("❌ Usuario no encontrado en la base de datos.");
        setPassword("");
        return;
      }

      const userData = userSnap.data();
      if (userData.admin) {
        router.push("/admin");
      } else {
        router.push(`/votacion/${userData.mesa}`);
      }
    } catch (err) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        setError("❌ Correo o contraseña incorrectos.");
      } else if (err.code === "auth/too-many-requests") {
        setError("⚠️ Demasiados intentos. Espera un momento e intenta nuevamente.");
      } else if (err.code === "auth/user-not-found") {
        setError("❌ Usuario no encontrado.");
      } else {
        setError("❌ Ocurrió un error al iniciar sesión. Intenta nuevamente.");
      }
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Iniciar Sesión</h2>
        {error && <p className="text-red-500 mb-3 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 flex items-center justify-center text-white rounded transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <>
              {/* Spinner animado */}
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Iniciando...
            </>
          ) : (
            "Entrar"
          )}
        </button>
      </div>
    </main>
  );
}
