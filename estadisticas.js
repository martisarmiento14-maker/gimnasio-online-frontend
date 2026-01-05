let grafico = null;

async function cargarStats() {
    const mes = document.getElementById("mes").value;
    if (!mes) return alert("Seleccioná un mes");

    try {
        const res = await fetch(
            `https://gimnasio-online-1.onrender.com/estadisticas?mes=${mes}`
        );
        const data = await res.json();

        const ctx = document.getElementById("graficoAlumnos").getContext("2d");

        if (grafico) grafico.destroy();

        grafico = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Altas", "Renovaciones"],
                datasets: [{
                    label: `Alumnos ${mes}`,
                    data: [data.altas, data.renovaciones]
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });

    } catch (err) {
        console.error(err);
        alert("Error cargando estadísticas");
    }
}
