const API_URL = "https://gimnasio-online-1.onrender.com";

document.getElementById("selectorMes").addEventListener("change", async (e) => {
  const [anio, mes] = e.target.value.split("-");

  const res = await fetch(`${API_URL}/estadisticas?mes=${mes}&anio=${anio}`);
  const data = await res.json();

  // GRÁFICO 1 — TOTAL ALUMNOS
  new Chart(document.getElementById("graficoTotal"), {
    type: "bar",
    data: {
      labels: ["Alumnos del mes"],
      datasets: [{
        label: "Total",
        data: [data.totalAlumnos]
      }]
    }
  });

  // GRÁFICO 2 — PLANES
  new Chart(document.getElementById("graficoPlanes"), {
    type: "bar",
    data: {
      labels: ["EG", "Personalizado", "Running", "EG + Running", "Pers + Running"],
      datasets: [{
        label: "Cantidad",
        data: [
          data.planes.eg,
          data.planes.personalizado,
          data.planes.running,
          data.planes.combo_eg,
          data.planes.combo_pers
        ]
      }]
    }
  });

  // GRÁFICO 3 — DÍAS EG
  new Chart(document.getElementById("graficoDiasEG"), {
    type: "doughnut",
    data: {
      labels: ["3 días", "5 días"],
      datasets: [{
        data: [data.diasEG.tres, data.diasEG.cinco]
      }]
    }
  });

  // GRÁFICO 4 — DÍAS PERSONALIZADO
  new Chart(document.getElementById("graficoDiasPers"), {
    type: "doughnut",
    data: {
      labels: ["3 días", "5 días"],
      datasets: [{
        data: [
          data.diasPersonalizado.tres,
          data.diasPersonalizado.cinco
        ]
      }]
    }
  });
});
