"use client";
import React, { useMemo } from "react";
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

export default function Estadisticas({ votantes }) {
  // 🔹 Totales fijos
  const TOTAL_GENERAL = 3081;
  const TOTAL_SEGUROS = 680;
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

  // 🔹 Calcular datos a partir de votantes
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

    const porcentajeParticipacion = ((totalVotaron / TOTAL_GENERAL) * 100).toFixed(1);
    const porcentajeNuestrosSobreVotaron = totalVotaron
      ? ((nuestrosVotaron / totalVotaron) * 100).toFixed(1)
      : 0;
    const porcentajeSegurosAvance = ((nuestrosVotaron / TOTAL_SEGUROS) * 100).toFixed(1);

    const segurosPorMesa = Object.keys(SEGUROS_POR_MESA).map((mesa) => {
      const segurosMesa = SEGUROS_POR_MESA[mesa];
      const votaronMesa = votantes.filter(
        (v) => Number(v.mesa) === Number(mesa) && v.votoSeguro === true
      ).length;
      const porcentaje = ((votaronMesa / segurosMesa) * 100).toFixed(1);
      return {
        mesa,
        segurosMesa,
        votaronMesa,
        porcentaje: Number(porcentaje),
      };
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

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        📊 Estadísticas en Tiempo Real
      </h1>

      {/* === Gráficos principales === */}
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
      <section className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-100">
          Avance de Seguros por Mesa
        </h2>

        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={segurosPorMesa}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="mesa"
                label={{ value: "Mesa", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                label={{ value: "% Avance", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="porcentaje" fill="#00C49F" name="% Seguros votaron" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
          Porcentaje de seguros que ya votaron por cada mesa
        </p>
      </section>
    </main>
  );
}

// 🔹 Subcomponente de gráfico circular
function ChartCard({ title, data, total, colors }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-[340px]">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-700 dark:text-gray-200">
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
      <p className="text-center text-gray-500 dark:text-gray-400 mt-2">{total}</p>
    </div>
  );
}
