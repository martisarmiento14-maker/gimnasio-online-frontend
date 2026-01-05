const API_URL = "https://gimnasio-online-1.onrender.com";

document.getElementById("selectorMes").addEventListener("change", async (e) => {
    const [anio, mes] = e.target.value.split("-");

    const res = await fetch(
        `${API_URL}/estadisticas?mes=${mes}&anio=${anio}`
    );

    const data = await res.json();
    console.log(data);

    new Chart(document.getElementById("graficoPagos"), {
        type: "doughnut",
        data: {
            labels: ["Efectivo", "Transferencia"],
            datasets: [{
                data: [
                    data.ingresos.efectivo || 0,
                    data.ingresos.transferencia || 0
                ]
            }]
        }
    });

    new Chart(document.getElementById("graficoEvolucion"), {
        type: "line",
        data: {
            labels: data.evolucion.map(e => e.mes),
            datasets: [{
                label: "Ingresos",
                data: data.evolucion.map(e => e.ingresos)
            }]
        }
    });
});
