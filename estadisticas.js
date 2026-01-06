const API_URL = "https://gimnasio-online-1.onrender.com";

let chartAltas = null;
let chartPlanes = null;
let chartEgDias = null;
let chartPersDias = null;
let chartIngresos = null;


document.addEventListener("DOMContentLoaded", () => {
    const inputMes = document.getElementById("mesSeleccionado");

    const hoy = new Date();
    const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
    inputMes.value = mesActual;

    cargarTodo(mesActual);

    inputMes.addEventListener("change", () => {
        cargarTodo(inputMes.value);
    });
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
                label: "Cantidad de alumnos",
                data: [data.altas, data.renovaciones]
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
        type: "bar",
        data: {
            labels: [
                "Personalizado",
                "EG",
                "Running",
                "Combo Personalizado + Running",
                "Combo EG + Running"
            ],
            datasets: [{
                label: "Planes vendidos",
                data: [
                    data.personalizado,
                    data.eg,
                    data.running,
                    data.combo1,
                    data.combo2
                ]
            }]
        },
        options: {
            responsive: true
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
                ]
            }]
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
                ]
            }]
        }
    });
}
async function cargarGraficoIngresos(mes) {
    const res = await fetch(`${API_URL}/estadisticas/ingresos?mes=${mes}`);
    const data = await res.json();

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
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const metodo = index === 0 ? "efectivo" : "transferencia";

                            return [
                                `Total: $${context.raw}`,
                                `Personas: ${data[metodo].personas}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
} 