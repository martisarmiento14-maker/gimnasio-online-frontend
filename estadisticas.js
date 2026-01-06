const API_URL = "https://gimnasio-online-1.onrender.com";

let chartAltas = null;
let chartPlanes = null;
let chartEgDias = null;
let chartPersDias = null;
let chartIngresos = null;
Chart.defaults.color = "#e5e7eb";
Chart.defaults.font.family = "Inter, Arial, sans-serif";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.tooltip.backgroundColor = "#111827";
Chart.defaults.plugins.tooltip.borderColor = "#7c3aed";
Chart.defaults.plugins.tooltip.borderWidth = 1;



document.addEventListener("DOMContentLoaded", () => {
    const inputMes = document.getElementById("mesSeleccionado");

    const hoy = new Date();
    const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
    inputMes.value = mesActual;

    cargarTodo(mesActual);

    inputMes.addEventListener("change", () => {
        cargarTodo(inputMes.value);
    })
});

async function cargarTodo(mes) {
    await cargarGraficoAltas(mes);
    await cargarGraficoPlanes(mes);
    await cargarGraficoEgDias(mes);
    await cargarGraficoPersDias(mes);
    await cargarGraficoIngresos(mes);
}


// ================================
// 📊 GRÁFICO ALTAS / RENOVACIONES
// ================================
async function cargarGraficoAltas(mes) {
    const res = await fetch(`${API_URL}/estadisticas?mes=${mes}`);
    const data = await res.json();

    document.getElementById("totalMes").innerText =
        `Total del mes: ${data.total} alumnos`;

    const ctx = document.getElementById("graficoAltas");

    if (chartAltas) chartAltas.destroy();

    chartAltas = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Altas", "Renovaciones"],
            datasets: [{
            label: "Alumnos",
            data: [data.altas, data.renovaciones],
            backgroundColor: ["#22c55e", "#7c3aed"],
            borderRadius: 8,
            maxBarThickness: 60
        }]

        },
        options: {
            responsive: true
        }
    });
}

// ================================
// 💪 GRÁFICO PLANES DEL MES
// ================================
async function cargarGraficoPlanes(mes) {
    const res = await fetch(`${API_URL}/estadisticas/planes?mes=${mes}`);
    const data = await res.json();

    const ctx = document.getElementById("graficoPlanes");

    if (chartPlanes) chartPlanes.destroy();

    chartPlanes = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: [
                "EG",
                "Personalizado",
                "Running",
                "MMA",
                "Running + EG",
                "Running + Personalizado",
                "MMA + EG",
                "MMA + Personalizado",
                "MMA + Running + EG",
                "MMA + Running + Personalizado"
            ],
            datasets: [{
                data: [
                    data.eg,
                    data.personalizado,
                    data.running,
                    data.mma,
                    data.running_eg,
                    data.running_personalizado,
                    data.mma_eg,
                    data.mma_personalizado,
                    data.mma_running_eg,
                    data.mma_running_personalizado
                ],
                backgroundColor: [
                    "#22c55e", // EG
                    "#7c3aed", // Personalizado
                    "#38bdf8", // Running
                    "#ef4444", // MMA
                    "#facc15", // Run + EG
                    "#fb7185", // Run + Pers
                    "#a855f7", // MMA + EG
                    "#ec4899", // MMA + Pers
                    "#14b8a6", // MMA + Run + EG
                    "#f97316"  // MMA + Run + Pers
                ],
                borderWidth: 0
            }]
        },
        options: {
            cutout: "70%",
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}


async function cargarGraficoEgDias(mes) {
    const res = await fetch(`${API_URL}/estadisticas/planes-dias?mes=${mes}`);
    const data = await res.json();

    const ctx = document.getElementById("graficoEgDias");

    if (chartEgDias) chartEgDias.destroy();

    chartEgDias = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["3 días", "5 días"],
            datasets: [{
                label: "Plan EG",
                data: [
                    data.eg_3_dias,
                    data.eg_5_dias
                ],
                backgroundColor: "#22c55e",
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: "y",   // 🔹 BARRAS LATERALES
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

async function cargarGraficoPersDias(mes) {
    const res = await fetch(`${API_URL}/estadisticas/planes-dias?mes=${mes}`);
    const data = await res.json();

    const ctx = document.getElementById("graficoPersDias");

    if (chartPersDias) chartPersDias.destroy();

    chartPersDias = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["3 días", "5 días"],
            datasets: [{
                label: "Plan Personalizado",
                data: [
                    data.pers_3_dias,
                    data.pers_5_dias
                ],
                backgroundColor: "#7c3aed",
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: "y",   // 🔹 BARRAS LATERALES
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}


async function cargarGraficoIngresos(mes) {
    const res = await fetch(`${API_URL}/estadisticas/ingresos?mes=${mes}`);
    const data = await res.json();

    const totalIngresos =
        (data.efectivo?.total || 0) +
        (data.transferencia?.total || 0);

    const totalMesEl = document.getElementById("totalMes");
    const textoActual = totalMesEl.innerText.split("|")[0].trim();

    totalMesEl.innerText =
        `${textoActual} | Ingresos: $${totalIngresos.toLocaleString("es-AR")}`;

    const ctx = document.getElementById("graficoIngresos");

    if (chartIngresos) chartIngresos.destroy();

    chartIngresos = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Efectivo", "Transferencia"],
            datasets: [{
                label: "Ingresos del mes ($)",
                data: [
                    data.efectivo.total,
                    data.transferencia.total
                ],
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
