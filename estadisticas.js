const API_URL = "https://gimnasio-online-1.onrender.com";

// ==========================
// CONFIG GLOBAL CHART.JS
// ==========================
Chart.defaults.color = "#e5e7eb";
Chart.defaults.font.family = "Inter, Arial, sans-serif";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.tooltip.backgroundColor = "#111827";
Chart.defaults.plugins.tooltip.borderColor = "#7c3aed";
Chart.defaults.plugins.tooltip.borderWidth = 1;

let chartIngresos = null;
let chartAltas = null;

// ==========================
// 💰 INGRESOS DEL MES
// ==========================
async function cargarGraficoIngresos(mes) {
    const res = await fetch(
        `${API_URL}/estadisticas/ingresos?mes=${mes}`
    );
    const data = await res.json();

    const efectivo = data.efectivo || 0;
    const transferencia = data.transferencia || 0;
    const total = data.total || 0;

    document.getElementById("totalMes").innerText =
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
                borderRadius: 8,
                maxBarThickness: 60,
                backgroundColor: ["#22c55e", "#7c3aed"]
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ==========================
// 👥 ALUMNOS ACTIVOS DEL MES
// ==========================
async function cargarAlumnosActivos(mes) {
    const res = await fetch(
        `${API_URL}/estadisticas/alumnos-activos?mes=${mes}`
    );
    const data = await res.json();

    document.getElementById("totalAlumnosMes").innerText =
        `${data.total} alumnos activos`;
}

// ==========================
// 🔁 ALTAS VS RENOVACIONES
// ==========================
async function cargarAltasVsRenovaciones(mes) {
    const res = await fetch(
        `${API_URL}/estadisticas/altas-vs-renovaciones?mes=${mes}`
    );
    const data = await res.json();

    const altas = data.altas || 0;
    const renovaciones = data.renovaciones || 0;

    const ctx = document.getElementById("graficoAltas");

    if (chartAltas) chartAltas.destroy();

    chartAltas = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Altas", "Renovaciones"],
            datasets: [{
                data: [altas, renovaciones],
                backgroundColor: ["#22c55e", "#3b82f6"],
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

// ==========================
// 📅 MANEJO DE MES
// ==========================
const inputMes = document.getElementById("mesSeleccionado");

const hoy = new Date();
const mesActual = hoy.toISOString().slice(0, 7);

inputMes.value = mesActual;

// carga inicial
cargarGraficoIngresos(mesActual);
cargarAlumnosActivos(mesActual);
cargarAltasVsRenovaciones(mesActual);

// cambio de mes
inputMes.addEventListener("change", () => {
    const mes = inputMes.value;
    cargarGraficoIngresos(mes);
    cargarAlumnosActivos(mes);
    cargarAltasVsRenovaciones(mes);
});
