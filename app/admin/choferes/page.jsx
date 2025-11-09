"use client";
import { useState } from "react";

const choferes = [
  { id: 1, nombre: "Oli", telefono: "+5492664307841" },
  { id: 2, nombre: "María Pérez", telefono: "+5491133344455" },
  { id: 3, nombre: "Luis Díaz", telefono: "+5491145678901" },
];

export default function Page() {
  const [chofer, setChofer] = useState(null);
  const [nombre, setNombre] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [destino, setDestino] = useState("");
  const [telefono, setTelefono] = useState("");


  const handleEnviar = () => {
    if (!chofer) return alert("Seleccioná un chofer");
    const mensaje = `🚗 Hola ${chofer.nombre}\n\n👤 Necesito que pasen a buscar a: ${nombre}\n📍 Domicilio: ${domicilio}\n Detalle: ${destino}\n Telefono de la persona: ${telefono}`;
    const url = `https://wa.me/${chofer.telefono.replace("+", "")}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Asignar Chofer</h1>

      <select
        onChange={(e) =>
          setChofer(choferes.find((c) => c.id === parseInt(e.target.value)))
        }
        className="w-full border p-2 rounded"
      >
        <option value="">Seleccionar chofer...</option>
        {choferes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Persona a buscar"
        className="w-full border p-2 rounded"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Domicilio"
        className="w-full border p-2 rounded"
        value={domicilio}
        onChange={(e) => setDomicilio(e.target.value)}
      />
      <input
        type="text"
        placeholder="Detalles"
        className="w-full border p-2 rounded"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
      />
      <input
  type="number"
  placeholder="Teléfono de la persona"
  className="w-full border p-2 rounded appearance-none"
  style={{
    MozAppearance: "textfield",
  }}
  value={telefono}
  onChange={(e) => setTelefono(e.target.value)}
/>

      <button
        onClick={handleEnviar}
        className="bg-green-500 text-white w-full p-2 rounded font-semibold hover:bg-green-600"
      >
        Enviar por WhatsApp
      </button>
    </div>
  );
}
