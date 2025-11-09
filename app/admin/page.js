"use client";
import React, { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { LogOut, BarChart2, Users, Car, Menu, X } from "lucide-react";
import Estadisticas from "../components/Estadisticas";
import Choferes from "./choferes/page";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [votantes, setVotantes] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState("todas");
  const [padronTotal, setPadronTotal] = useState([]);
  const [vistaActiva, setVistaActiva] = useState("votantes");
  const [eliminando, setEliminando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuMesasAbierto, setMenuMesasAbierto] = useState(false);
  const router = useRouter();

  // 🔹 Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // 🔹 Verificación admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      const userRef = doc(db, "usuariosMesa", currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data().admin === true) {
        setIsAdmin(true);
      } else {
        router.push("/no-access");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // 🔹 Escuchar votantes
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "votantes"), orderBy("horaVoto", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVotantes(data);
    });
    return () => unsub();
  }, [isAdmin]);

  // 🔹 Cargar padrón total
  useEffect(() => {
    const fetchPadron = async () => {
      const snap = await getDoc(doc(db, "meta", "padronTotal"));
      if (snap.exists()) setPadronTotal(snap.data().personas || []);
    };
    fetchPadron();
  }, []);

  // 🔹 Filtro mesas
  const mesasUnicas = [...new Set(votantes.map((v) => v.mesa))];
  const votantesFiltrados =
    mesaSeleccionada === "todas"
      ? votantes
      : votantes.filter((v) => v.mesa === mesaSeleccionada);

  // 🔹 Formato hora
  const formatHora = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  // 🔹 Eliminar voto
  const eliminarVoto = async (votante) => {
    try {
      setEliminando(true);
      await deleteDoc(doc(db, "votantes", votante.id));

      const mesaRef = doc(db, "padrones", `mesa_${votante.mesa}`);
      const mesaSnap = await getDoc(mesaRef);
      if (mesaSnap.exists()) {
        const personas = mesaSnap.data().personas.map((p) =>
          p.matricula === votante.dni
            ? { ...p, yaVoto: false, horaVoto: null }
            : p
        );
        await updateDoc(mesaRef, { personas });
      }

      setConfirmDelete(null);
      setToast({ type: "success", message: "Voto eliminado correctamente ✅" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Error al eliminar el voto ❌" });
    } finally {
      setEliminando(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // 🔹 Exportar Excel
  const exportarExcel = () => {
    if (votantesFiltrados.length === 0) return;

    const datos = votantesFiltrados.map((v) => ({
      DNI: v.dni,
      Nombre: v.nombre,
      Apellido: v.apellido,
      Mesa: v.mesa,
      "Hora de Voto": formatHora(v.horaVoto),
      "Voto Seguro": v.votoSeguro ? "Sí" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Votantes");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const fecha = new Date().toISOString().split("T")[0];
    const nombreArchivo =
      mesaSeleccionada === "todas"
        ? `votantes_todas_${fecha}.xlsx`
        : `votantes_mesa_${mesaSeleccionada}_${fecha}.xlsx`;
    saveAs(blob, nombreArchivo);
  };

  if (loading) return <p className="p-8">Cargando...</p>;
  if (!isAdmin) return null;

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 text-gray-900">
      {/* 🔹 Header */}
      <header className="sticky top-0 z-20 bg-gray-800 text-white p-4 rounded-xl shadow-md flex justify-between items-center mb-6">
        <h1 className="text-lg sm:text-2xl font-bold">Panel de Administración</h1>

        {/* Menú móvil */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuAbierto((prev) => !prev)}
            className="p-2 bg-gray-700 rounded-lg"
          >
            {menuAbierto ? <X /> : <Menu />}
          </button>
        </div>

        {/* Menú desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setVistaActiva("votantes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              vistaActiva === "votantes"
                ? "bg-orange-600 text-white"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            <Users className="w-5 h-5" /> Votantes
          </button>

          <button
            onClick={() => setVistaActiva("estadisticas")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              vistaActiva === "estadisticas"
                ? "bg-orange-600 text-white"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            <BarChart2 className="w-5 h-5" /> Estadísticas
          </button>

          <button
            onClick={() => setVistaActiva("choferes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              vistaActiva === "choferes"
                ? "bg-orange-600 text-white"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            <Car className="w-5 h-5" /> Choferes
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuMesasAbierto((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              🗳️ Mesas
            </button>

            {menuMesasAbierto && (
              <div className="absolute right-0 bg-white text-black rounded-lg shadow-lg mt-2 w-44 z-30 animate-fadeIn">
                {[573, 574, 575, 576, 577, 578, 579, 580, 581].map((mesa) => (
                  <button
                    key={mesa}
                    onClick={() => {
                      router.push(`/votacion/${mesa}`);
                      setMenuMesasAbierto(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Mesa {mesa}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* 🔹 Menú móvil desplegable */}
      {menuAbierto && (
        <div className="md:hidden bg-white rounded-xl shadow-md p-4 mb-6 space-y-3 text-center">
          <button
            onClick={() => {
              setVistaActiva("votantes");
              setMenuAbierto(false);
            }}
            className="w-full bg-orange-600 text-white py-2 rounded-lg"
          >
            Votantes
          </button>
          <button
            onClick={() => {
              setVistaActiva("estadisticas");
              setMenuAbierto(false);
            }}
            className="w-full bg-gray-300 py-2 rounded-lg"
          >
            Estadísticas
          </button>
          <button
            onClick={() => {
              setVistaActiva("choferes");
              setMenuAbierto(false);
            }}
            className="w-full bg-gray-300 py-2 rounded-lg"
          >
            Choferes
          </button>
          <button
            onClick={() => setMenuMesasAbierto((prev) => !prev)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Mesas
          </button>
          {menuMesasAbierto && (
            <div className="bg-gray-100 rounded-lg p-2 space-y-1">
              {[573, 574, 575, 576, 577, 578, 579, 580, 581].map((mesa) => (
                <button
                  key={mesa}
                  onClick={() => {
                    router.push(`/votacion/${mesa}`);
                    setMenuMesasAbierto(false);
                    setMenuAbierto(false);
                  }}
                  className="block w-full text-left px-3 py-1 rounded hover:bg-gray-200"
                >
                  Mesa {mesa}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {/* 🔹 Vista de votantes */}
      {vistaActiva === "votantes" && (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="font-medium">Mesa:</label>
              <select
                value={mesaSeleccionada}
                onChange={(e) => setMesaSeleccionada(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas</option>
                {mesasUnicas.map((mesa) => (
                  <option key={mesa} value={mesa}>
                    Mesa {mesa}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={exportarExcel}
              className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              📥 Exportar Excel
            </button>
          </div>

          <div className="overflow-x-auto shadow-lg rounded-2xl mb-12">
            <table className="min-w-full bg-white rounded-2xl text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">DNI</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Apellido</th>
                  <th className="px-4 py-2 text-center">Mesa</th>
                  <th className="px-4 py-2 text-center">Hora</th>
                  <th className="px-4 py-2 text-center">Seguro</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {votantesFiltrados.map((v) => (
                  <tr
                    key={v.id}
                    className={`border-t hover:bg-gray-100 transition ${
                      v.votoSeguro ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2">{v.dni}</td>
                    <td className="px-4 py-2 font-medium">{v.nombre}</td>
                    <td className="px-4 py-2">{v.apellido}</td>
                    <td className="px-4 py-2 text-center">{v.mesa}</td>
                    <td className="px-4 py-2 text-center">
                      {formatHora(v.horaVoto)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {v.votoSeguro ? "✅" : "—"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => setConfirmDelete(v)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 🔹 Vista de estadísticas */}
      {vistaActiva === "estadisticas" && (
        <div className="animate-fadeIn mt-8">
          <Estadisticas votantes={votantes} padronTotal={padronTotal} />
        </div>
      )}

      {/* 🔹 Vista de choferes */}
      {vistaActiva === "choferes" && (
        <div className="animate-fadeIn mt-8">
          <Choferes />
        </div>
      )}

      {/* 🔹 Modal confirmación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center animate-fadeIn">
            <h2 className="text-lg font-bold mb-4">
              ¿Eliminar voto de {confirmDelete.nombre} {confirmDelete.apellido}?
            </h2>
            <p className="text-gray-600 mb-6">
              Esta acción revertirá el estado en el padrón.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarVoto(confirmDelete)}
                disabled={eliminando}
                className={`px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 ${
                  eliminando
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {eliminando ? "Eliminando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-500 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
