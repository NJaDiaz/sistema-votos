"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "../../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { User } from "lucide-react";

export default function MesaPage() {
  const params = useParams();
  const mesa = params?.mesa;
  const router = useRouter();

  const [numeroOrden, setNumeroOrden] = useState("");
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "usuariosMesa", user.uid);
        const userSnap = await getDoc(docRef);
        if (userSnap.exists()) {
          setUsuario(userSnap.data());
        }
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const buscarPersona = async () => {
    if (!mesa || !numeroOrden) return;
    setLoading(true);
    setMensaje(null);

    try {
      const docRef = doc(db, "padrones", `mesa_${mesa}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const personas = docSnap.data().personas;
        const encontrada = personas.find(
          (p) => p.orden === parseInt(numeroOrden)
        );
        setPersona(encontrada || null);
        if (!encontrada) {
          setMensaje({ tipo: "error", texto: "No se encontró la persona." });
        }
      } else {
        setMensaje({ tipo: "error", texto: "No se encontró la mesa." });
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: "Error al buscar persona." });
    } finally {
      setLoading(false);
    }
  };

  const marcarVoto = async () => {
    if (!persona) return;
    setLoading(true);

    try {
      const docRef = doc(db, "padrones", `mesa_${mesa}`);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      const personas = docSnap.data().personas.map((p) =>
        p.orden === persona.orden
          ? {
              ...p,
              yaVoto: true,
              horaVoto: Date.now(),
              votoSeguro: p.votoSeguro ?? false,
            }
          : p
      );

      await updateDoc(docRef, { personas });

      await addDoc(collection(db, "votantes"), {
        dni: persona.matricula,
        nombre: persona.nombre,
        apellido: persona.apellido,
        horaVoto: Date.now(),
        mesa: mesa.replace("mesa_", ""),
        votoSeguro: persona.votoSeguro ?? false,
      });

      setMensaje({ tipo: "exito", texto: "✅ Voto registrado correctamente." });
      setPersona(null);
      setNumeroOrden("");
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: "❌ Error al registrar el voto." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50">
      {/* 🔹 Header */}
      <div className="w-full bg-white shadow-sm border-b py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <User size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500 leading-tight">Fiscal de Mesa</p>
            <p className="font-semibold text-gray-800 text-base sm:text-lg truncate">
              {usuario ? `👋 Hola, ${usuario.nombre}` : "Cargando..."}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-sm sm:text-base rounded-lg shadow-sm transition self-end sm:self-auto"
        >
          🔒 Cerrar
        </button>
      </div>

      {/* 🔹 Contenido principal */}
      <div className="flex flex-col items-center justify-start p-6 sm:p-8 w-full max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          🗳️ Mesa {mesa}
        </h1>

        {/* Mensajes */}
        {mensaje && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-center w-full ${
              mensaje.tipo === "exito"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        {/* Buscador */}
        <div className="flex flex-col sm:flex-row w-full gap-2 mb-6">
          <input
            type="number"
            value={numeroOrden}
            onChange={(e) => setNumeroOrden(e.target.value)}
            placeholder="Número de orden"
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base appearance-none"
          />
          <button
            onClick={buscarPersona}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm sm:text-base transition"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Datos de persona */}
        {persona && (
          <div className="w-full bg-white shadow-lg rounded-xl p-5 sm:p-6 border">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              Datos del Elector
            </h2>
            <div className="space-y-1 text-sm sm:text-base">
              <p>
                <span className="font-medium">Nombre:</span> {persona.nombre}
              </p>
              <p>
                <span className="font-medium">Apellido:</span> {persona.apellido}
              </p>
              <p>
                <span className="font-medium">DNI:</span> {persona.matricula}
              </p>
              <p className="mt-2">
                <span className="font-medium">Estado:</span>{" "}
                {persona.yaVoto ? (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    ✅ Ya votó
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    ⏳ No votó
                  </span>
                )}
              </p>
            </div>

            {!persona.yaVoto && (
              <button
                onClick={marcarVoto}
                disabled={loading}
                className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow transition text-sm sm:text-base"
              >
                {loading ? "Registrando..." : "Marcar Voto"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
