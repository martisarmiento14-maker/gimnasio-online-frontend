const API_URL = "https://gimnasio-online-1.onrender.com";

let chartAltas = null;
let chartPlanes = null;

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
