let grafico = null;

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

        const data = await res.json();
        console.log("📊 DATA:", data);

        const total = data.total_alumnos_mes;

        const canvas = document.getElementById("graficoAlumnos");
        if (!canvas) {
            console.error("❌ No existe el canvas");
            return;
        }

        const ctx = canvas.getContext("2d");

        if (grafico) {
            grafico.destroy();
        }

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
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("❌ ERROR REAL:", error);
        alert("Error al dibujar el gráfico");
    }
}

