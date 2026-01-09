const API_URL = "https://gimnasio-online-1.onrender.com";

let chartIngresos = null;

Chart.defaults.color = "#e5e7eb";
Chart.defaults.font.family = "Inter, Arial, sans-serif";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.tooltip.backgroundColor = "#111827";
Chart.defaults.plugins.tooltip.borderColor = "#7c3aed";
Chart.defaults.plugins.tooltip.borderWidth = 1;

async function cargarGraficoIngresos(mes) {
    const res = await fetch(
        `${API_URL}/estadisticas/ingresos?mes=${mes}`
    );

    const data = await res.json();

    // ✅ TOTALES DIRECTOS
    const efectivo = data.efectivo || 0;
    const transferencia = data.transferencia || 0;
    const total = data.total || 0;

    // TEXTO SUPERIOR
    const totalMesEl = document.getElementById("totalMes");
    totalMesEl.innerText =
        `Ingresos del mes: $${total.toLocaleString("es-AR")}`;

    const ctx = document.getElementById("graficoIngresos");

    if (chartIngresos) chartIngresos.destroy();

    chartIngresos = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Efectivo", "Transferencia"],
            datasets: [{
                label: "Ingresos del mes ($)",
                data: [efectivo, transferencia],
                backgroundColor: ["#22c55e", "#7c3aed"],
                borderRadius: 8,
                maxBarThickness: 60
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


async function cargarAlumnosMes(mes) {
    const res = await fetch(
        `${API_URL}/estadisticas/alumnos?mes=${mes}`
    );

    const data = await res.json();

    document.getElementById("totalAlumnosMes").innerText =
        `${data.total} alumnos`;
}

const inputMes = document.getElementById("mesSeleccionado");

const hoy = new Date();
const mesActual = hoy.toISOString().slice(0, 7);

inputMes.value = mesActual;
cargarGraficoIngresos(mesActual);

inputMes.addEventListener("change", () => {
    cargarGraficoIngresos(inputMes.value);
});
