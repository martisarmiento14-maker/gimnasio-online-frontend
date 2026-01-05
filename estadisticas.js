const API_URL = "https://gimnasio-online-1.onrender.com";

document.getElementById("mes").addEventListener("change", cargarStats);

async function cargarStats(e) {
    const mes = e.target.value;

    const res = await fetch(`${API_URL}/estadisticas?mes=${mes}`);
    const data = await res.json();

    // =====================
    // 1️⃣ TOTAL ALUMNOS
    // =====================
    const altas = data.totalAlumnos.find(x => x.tipo === "alta")?.count || 0;
    const renov = data.totalAlumnos.find(x => x.tipo === "renovacion")?.count || 0;

    new Chart(graficoAlumnos, {
        type: "bar",
        data: {
            labels: ["Altas", "Renovaciones"],
            datasets: [{
                label: "Alumnos",
                data: [altas, renov]
            }]
        }
    });

    // =====================
    // 5️⃣ INGRESOS
    // =====================
    const efectivo = data.ingresos.find(x => x.metodo_pago === "efectivo")?.sum || 0;
    const trans = data.ingresos.find(x => x.metodo_pago === "transferencia")?.sum || 0;

    new Chart(graficoIngresos, {
        type: "pie",
        data: {
            labels: ["Efectivo", "Transferencia"],
            datasets: [{
                data: [efectivo, trans]
            }]
        }
    });
}
