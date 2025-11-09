"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function EstadisticasPage() {
  const [votantes, setVotantes] = useState([]);

  // 🔹 Total general de personas (padrón completo)
  const TOTAL_GENERAL = 3058;

  // 🔹 Total de seguros (luego lo reemplazás con el real)
  const TOTAL_SEGUROS = 648;

  useEffect(() => {
    const fetchVotantes = async () => {
      const snapshot = await getDocs(collection(db, "votantes"));
      const lista = snapshot.docs.map((doc) => doc.data());
      setVotantes(lista);
    };

    fetchVotantes();
  }, []);

  const totalVotaron = votantes.length;
  const nuestrosVotaron = votantes.filter((v) => v.votoSeguro).length;

  // 🔹 Porcentajes
  const porcentajeParticipacion = ((totalVotaron / TOTAL_GENERAL) * 100).toFixed(1);
  const porcentajeNuestrosSobreVotaron = totalVotaron
    ? ((nuestrosVotaron / totalVotaron) * 100).toFixed(1)
    : 0;
  const porcentajeSegurosAvance = ((nuestrosVotaron / TOTAL_SEGUROS) * 100).toFixed(1);

  // 🔹 Datos para los gráficos
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

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        📊 Estadísticas en Tiempo Real
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center">
        {/* Participación general */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-[340px]">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-700 dark:text-gray-200">
            Participación General
          </h3>
          <PieChart width={300} height={300}>
            <Pie data={dataGeneral} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {dataGeneral.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
            {porcentajeParticipacion}% participación ({totalVotaron}/{TOTAL_GENERAL})
          </p>
        </div>

        {/* Nuestros sobre los que votaron */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-[340px]">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-700 dark:text-gray-200">
            Nuestros sobre los que votaron
          </h3>
          <PieChart width={300} height={300}>
            <Pie data={dataNuestros} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {dataNuestros.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
            {porcentajeNuestrosSobreVotaron}% de los votantes son nuestros
          </p>
        </div>

        {/* Avance de nuestros seguros */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-[340px]">
          <h3 className="text-lg font-semibold mb-4 text-center text-gray-700 dark:text-gray-200">
            Avance de nuestros seguros
          </h3>
          <PieChart width={300} height={300}>
            <Pie data={dataSeguros} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {dataSeguros.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
            {porcentajeSegurosAvance}% de nuestros seguros ya votaron ({nuestrosVotaron}/{TOTAL_SEGUROS})
          </p>
        </div>
      </div>
    </main>
  );
}
