"use client";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function MesaComponent({ mesa }) {
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "padrones", mesa);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setPersonas(docSnap.data().personas);
    };
    fetchData();
  }, [mesa]);

  const marcarVoto = async (i) => {
    const docRef = doc(db, "padrones", mesa);
    const newPersonas = [...personas];
    newPersonas[i].yaVoto = true;
    newPersonas[i].horaVoto = Date.now();
    setPersonas(newPersonas);
    await updateDoc(docRef, { personas: newPersonas });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Mesa {mesa.replace("mesa_", "")}</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Orden</th>
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Apellido</th>
            <th className="border px-2 py-1">Ya votó</th>
            <th className="border px-2 py-1">Acción</th>
          </tr>
        </thead>
        <tbody>
          {personas.map((p, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{p.ordenmesa}</td>
              <td className="border px-2 py-1">{p.nombres}</td>
              <td className="border px-2 py-1">{p.apellidos}</td>
              <td className="border px-2 py-1">{p.yaVoto ? "Sí" : "No"}</td>
              <td className="border px-2 py-1">
                {!p.yaVoto && <button onClick={() => marcarVoto(i)} className="bg-green-500 text-white px-2 py-1 rounded">Marcar Voto</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
