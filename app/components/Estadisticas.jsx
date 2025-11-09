"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  ResponsiveContainer,
} from "recharts";
import {
  collection,
  setDoc,
  doc,
  onSnapshot,
  collectionGroup,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Estadisticas({ votantes }) {
  const TOTAL_GENERAL = 3081;
  const TOTAL_SEGUROS = 683;
  const SEGUROS_POR_MESA = {
    573: 61,
    574: 87,
    575: 62,
    576: 67,
    577: 89,
    578: 75,
    579: 70,
    580: 79,
    581: 90,
  };

  const [votos, setVotos] = useState([]);
  const [formData, setFormData] = useState({
    mesa: "",
    partido: "",
    tipo: "Intendente",
    cantidad: "",
  });

  // 🔥 Escuchar todos los votos en tiempo real (de todas las mesas)
  useEffect(() => {
    const unsub = onSnapshot(collectionGroup(db, "votos"), (snapshot) => {
      const data = snapshot.docs.map((d) => d.data());
      setVotos(data);
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // 🔥 Guardar o reemplazar voto (crea mesa si no existe)
  const handleAddVoto = async (e) => {
    e.preventDefault();
    if (!formData.mesa || !formData.partido || !formData.cantidad) return;

    const mesaId = `mesa_${formData.mesa}`;
    const nueva = {
      mesa: formData.mesa,
      partido: formData.partido.trim(),
      tipo: formData.tipo,
      cantidad: Number(formData.cantidad),
      timestamp: new Date(),
    };

    // crea automáticamente la “clase” mesa_X si no existe
    const votoId = `${formData.tipo}_${formData.partido}`;
    await setDoc(doc(collection(db, "mesas", mesaId, "votos"), votoId), nueva);

    setFormData({ mesa: "", partido: "", tipo: "Intendente", cantidad: "" });
  };

  // 🔥 Reiniciar todo (borra todos los votos)
  const handleReiniciar = async () => {
    if (window.confirm("¿Seguro que querés reiniciar todos los votos cargados?")) {
      const snapshot = await getDocs(collectionGroup(db, "votos"));
      const deletePromises = snapshot.docs.map((d) =>
        deleteDoc(doc(db, d.ref.path))
      );
      await Promise.all(deletePromises);
    }
  };

  // === Agrupación ===
  const votosAgrupados = useMemo(() => {
    const agrupados = { Intendente: {}, Concejales: {} };
    const porMesa = {};

    votos.forEach(({ mesa, partido, tipo, cantidad }) => {
      agrupados[tipo][partido] = (agrupados[tipo][partido] || 0) + cantidad;

      if (!porMesa[mesa]) porMesa[mesa] = { Intendente: {}, Concejales: {} };
      porMesa[mesa][tipo][partido] =
        (porMesa[mesa][tipo][partido] || 0) + cantidad;
    });

    const toArray = (obj) => {
      const total = Object.values(obj).reduce((a, b) => a + b, 0);
      return Object.entries(obj).map(([name, value]) => ({
        name,
        value,
        porcentaje: total ? ((value / total) * 100).toFixed(1) : 0,
      }));
    };

    const totalIntendente = toArray(agrupados.Intendente);
    const totalConcejales = toArray(agrupados.Concejales);
    const mesas = Object.entries(porMesa).map(([mesa, tipos]) => ({
      mesa,
      intendente: toArray(tipos.Intendente),
      concejales: toArray(tipos.Concejales),
    }));

    return { totalIntendente, totalConcejales, mesas };
  }, [votos]);

  const totalIntendente = votosAgrupados.totalIntendente.reduce(
    (a, v) => a + v.value,
    0
  );
  const totalConcejales = votosAgrupados.totalConcejales.reduce(
    (a, v) => a + v.value,
    0
  );

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#FF6699",
    "#8884D8",
  ];

  // === Datos previos ===
  const {
    totalVotaron,
    nuestrosVotaron,
    porcentajeParticipacion,
    porcentajeNuestrosSobreVotaron,
    porcentajeSegurosAvance,
    segurosPorMesa,
  } = useMemo(() => {
    const totalVotaron = votantes.length;
    const nuestrosVotaron = votantes.filter((v) => v.votoSeguro === true).length;

    const porcentajeParticipacion = (
      (totalVotaron / TOTAL_GENERAL) *
      100
    ).toFixed(1);
    const porcentajeNuestrosSobreVotaron = totalVotaron
      ? ((nuestrosVotaron / totalVotaron) * 100).toFixed(1)
      : 0;
    const porcentajeSegurosAvance = (
      (nuestrosVotaron / TOTAL_SEGUROS) *
      100
    ).toFixed(1);

    const segurosPorMesa = Object.keys(SEGUROS_POR_MESA).map((mesa) => {
      const segurosMesa = SEGUROS_POR_MESA[mesa];
      const votaronMesa = votantes.filter(
        (v) => Number(v.mesa) === Number(mesa) && v.votoSeguro === true
      ).length;
      const porcentaje = ((votaronMesa / segurosMesa) * 100).toFixed(1);
      return { mesa, segurosMesa, votaronMesa, porcentaje: Number(porcentaje) };
    });

    return {
      totalVotaron,
      nuestrosVotaron,
      porcentajeParticipacion,
      porcentajeNuestrosSobreVotaron,
      porcentajeSegurosAvance,
      segurosPorMesa,
    };
  }, [votantes]);

  const dataGeneral = [
    { name: "Votaron", value: totalVotaron },
    { name: "Faltan", value: TOTAL_GENERAL - totalVotaron },
  ];
  const dataNuestros = [
    { name: "Nuestros que votaron", value: nuestrosVotaron },
    { name: "Otros votantes", value: totalVotaron - nuestrosVotaron },
  ];
  const dataSeguros = [
    { name: "Seguros que votaron", value: nuestrosVotaron },
    { name: "Seguros que faltan", value: TOTAL_SEGUROS - nuestrosVotaron },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        📊 Estadísticas en Tiempo Real
      </h1>

      {/* === Gráficos generales === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center">
        <ChartCard
          title="Participación General"
          data={dataGeneral}
          total={`${porcentajeParticipacion}% participación (${totalVotaron}/${TOTAL_GENERAL})`}
          colors={COLORS}
        />
        <ChartCard
          title="Nuestros sobre los que votaron"
          data={dataNuestros}
          total={`${porcentajeNuestrosSobreVotaron}% de los votantes son nuestros`}
          colors={COLORS}
        />
        <ChartCard
          title="Avance de nuestros seguros"
          data={dataSeguros}
          total={`${porcentajeSegurosAvance}% de nuestros seguros ya votaron (${nuestrosVotaron}/${TOTAL_SEGUROS})`}
          colors={COLORS}
        />
      </div>

      {/* === Avance por mesa === */}
      <section className="mt-16 bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Avance de Seguros por Mesa
        </h2>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={segurosPorMesa}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mesa" />
              <YAxis
                label={{ value: "% Avance", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="porcentaje" fill="#00C49F" name="% Seguros votaron" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* === Votos por partido === */}
      <section className="mt-16 bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            🗳️ Registro de Votos por Partido
          </h2>
          <button
            onClick={handleReiniciar}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Reiniciar todo
          </button>
        </div>

        <form
          onSubmit={handleAddVoto}
          className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8"
        >
          <input
            name="mesa"
            type="number"
            placeholder="Mesa"
            value={formData.mesa}
            onChange={handleChange}
            className="border rounded-lg p-2 w-28 text-center"
          />
          <input
            name="partido"
            placeholder="Partido"
            value={formData.partido}
            onChange={handleChange}
            className="border rounded-lg p-2 w-48"
          />
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option>Intendente</option>
            <option>Concejales</option>
          </select>
          <input
            name="cantidad"
            type="number"
            placeholder="Votos"
            value={formData.cantidad}
            onChange={handleChange}
            className="border rounded-lg p-2 w-24 text-center"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Agregar / Reemplazar
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center mb-16">
          <ChartCardWithPorcentaje
            title="Intendente (Total)"
            data={votosAgrupados.totalIntendente}
            total={`Total: ${totalIntendente} votos`}
            colors={COLORS}
          />
          <ChartCardWithPorcentaje
            title="Concejales (Total)"
            data={votosAgrupados.totalConcejales}
            total={`Total: ${totalConcejales} votos`}
            colors={COLORS}
          />
        </div>

        <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
          Resultados por Mesa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center">
          {votosAgrupados.mesas.map((mesaData) => (
            <div
              key={mesaData.mesa}
              className="bg-gray-50 p-4 rounded-2xl shadow"
            >
              <h4 className="text-lg font-semibold text-center text-gray-700 mb-2">
                Mesa {mesaData.mesa}
              </h4>
              <ChartCardWithPorcentaje
                title="Intendente"
                data={mesaData.intendente}
                total={`${mesaData.intendente.reduce(
                  (a, v) => a + v.value,
                  0
                )} votos`}
                colors={COLORS}
              />
              <ChartCardWithPorcentaje
                title="Concejales"
                data={mesaData.concejales}
                total={`${mesaData.concejales.reduce(
                  (a, v) => a + v.value,
                  0
                )} votos`}
                colors={COLORS}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

// === Componentes auxiliares ===
function ChartCardWithPorcentaje({ title, data, total, colors }) {
  if (!data || data.length === 0)
    return (
      <div className="bg-gray-100 p-6 rounded-2xl w-[320px] text-center text-gray-500">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p>No hay datos cargados aún.</p>
      </div>
    );

  return (
    <div className="bg-white p-4 rounded-2xl shadow w-[320px] mb-4">
      <h3 className="text-md font-semibold mb-2 text-center text-gray-700">
        {title}
      </h3>
      <PieChart width={300} height={250}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
      <p className="text-center text-gray-700 font-medium mt-2">{total}</p>
      <ul className="mt-2 text-sm text-gray-600 text-center">
        {data.map((d, i) => (
          <li key={i}>
            <strong>{d.name}</strong>: {d.value} votos ({d.porcentaje}%)
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartCard({ title, data, total, colors }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-[340px]">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">
        {title}
      </h3>
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
      <p className="text-center text-gray-500 mt-2">{total}</p>
    </div>
  );
}
