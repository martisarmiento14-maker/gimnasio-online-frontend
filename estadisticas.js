let grafico;

async function cargarStats() {
    const mes = document.getElementById("mes").value;

    if (!mes) {
        alert("Seleccioná un mes");
        return;
    }

    try {
        const res = await fetch(
            `https://gimnasio-online-1.onrender.com/estadisticas?mes=${mes}`
        );

        if (!res.ok) throw new Error("Error backend");

        const data = await res.json();

        const total = data.total_alumnos_mes;

        const ctx = document.getElementById("graficoAlumnos").getContext("2d");

        if (grafico) grafico.destroy();

        grafico = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Alumnos"],
                datasets: [{
                    label: "Total alumnos del mes",
                    data: [total]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        precision: 0
                    }
                }
            }
        });

    } catch (error) {
        console.error("❌ Error:", error);
        alert("No se pudieron cargar las estadísticas");
    }
}
