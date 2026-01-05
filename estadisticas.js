const API_URL = "https://gimnasio-online-1.onrender.com";

document.getElementById("selectorMes").addEventListener("change", async (e) => {
  const [anio, mes] = e.target.value.split("-");

  const res = await fetch(`${API_URL}/estadisticas?mes=${mes}&anio=${anio}`);
  const data = await res.json();

  /* ===============================
     GRÁFICO INGRESOS
  =============================== */
  new Chart(document.getElementById("graficoIngresos"), {
    type: "doughnut",
    data: {
      labels: ["Efectivo", "Transferencia"],
      datasets: [{
        data: [
          data.ingresos.efectivo,
          data.ingresos.transferencia
        ]
      }]
    }
  });

  /* ===============================
     GRÁFICO ALUMNOS
  =============================== */
  new Chart(document.getElementById("graficoAlumnos"), {
    type: "bar",
    data: {
      labels: [
        "Nuevos",
        "Renovaciones",
        "EG",
        "Personalizado",
        "Running",
        "EG + Running",
        "Pers + Running",
        "3 días",
        "5 días"
      ],
      datasets: [{
        label: "Cantidad",
        data: [
          data.alumnos.nuevos,
          data.alumnos.renovaciones,
          data.alumnos.planes.eg,
          data.alumnos.planes.personalizado,
          data.alumnos.planes.running,
          data.alumnos.planes.eg_running,
          data.alumnos.planes.pers_running,
          data.alumnos.dias.tres,
          data.alumnos.dias.cinco
        ]
      }]
    }
  });
});
