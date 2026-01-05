const API_URL = "https://gimnasio-online-1.onrender.com";

let charts = {};

document.addEventListener("DOMContentLoaded", () => {
    const mesInput = document.getElementById("mes");
    const hoy = new Date();
    mesInput.value = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}`;

    cargarStats();
    mesInput.addEventListener("change", cargarStats);
});

async function cargarStats() {
    const mes = document.getElementById("mes").value;
    if (!mes) return;

    const res = await fetch(`${API_URL}/estadisticas?mes=${mes}`);
    if (!res.ok) {
        console.error("❌ Error backend");
        return;
    }

    const data = await res.json();

    const totalAlumnos = data.totalAlumnos || [];
    const planesData = data.planes || [];
    const egDias = data.egDias || [];
    const persDias = data.persDias || [];
    const ingresos = data.ingresos || [];

    // 1️⃣ Alumnos
    const altas = Number(totalAlumnos.find(x => x.tipo === "alta")?.count || 0);
    const renov = Number(totalAlumnos.find(x => x.tipo === "renovacion")?.count || 0);

    crearGrafico("graficoAlumnos", "bar", ["Altas", "Renovaciones"], [altas, renov]);

    // 2️⃣ Planes
    let planes = {
        "Plan EG": 0,
        "Personalizado": 0,
        "Running": 0,
        "Combo Pers + Run": 0,
        "Combo EG + Run": 0
    };

    planesData.forEach(p => {
        if (p.plan_eg && p.plan_running) planes["Combo EG + Run"] += p.total;
        else if (p.plan_personalizado && p.plan_running) planes["Combo Pers + Run"] += p.total;
        else if (p.plan_eg) planes["Plan EG"] += p.total;
        else if (p.plan_personalizado) planes["Personalizado"] += p.total;
        else if (p.plan_running) planes["Running"] += p.total;
    });

    crearGrafico("graficoPlanes", "pie", Object.keys(planes), Object.values(planes));

    // 3️⃣ EG días
    crearGrafico(
        "graficoEg",
        "bar",
        egDias.map(d => `${d.dias_eg_pers} días`),
        egDias.map(d => d.count)
    );

    // 4️⃣ Pers días
    crearGrafico(
        "graficoPers",
        "bar",
        persDias.map(d => `${d.dias_eg_pers} días`),
        persDias.map(d => d.count)
    );

    // 5️⃣ Ingresos
    const efectivo = Number(ingresos.find(i => i.metodo_pago === "efectivo")?.sum || 0);
    const transferencia = Number(ingresos.find(i => i.metodo_pago === "transferencia")?.sum || 0);

    crearGrafico("graficoIngresos", "doughnut", ["Efectivo", "Transferencia"], [efectivo, transferencia]);
}

function crearGrafico(id, tipo, labels, data) {
    const ctx = document.getElementById(id);
    if (!ctx) return;

    if (charts[id]) charts[id].destroy();

    charts[id] = new Chart(ctx, {
        type: tipo,
        data: {
            labels,
            datasets: [{
                data,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}
