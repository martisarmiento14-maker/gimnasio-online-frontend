const API_URL = "https://gimnasio-online-1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const dniInput = document.getElementById("dniInput");
    const infoCard = document.getElementById("infoCard");
    const alertCuota = document.getElementById("alert-cuota");
    const clearBtn = document.getElementById("clearBtn");
    const bienvenidaEG = document.getElementById("bienvenidaEG");

    dniInput.addEventListener("change", async () => {
        const dni = dniInput.value.trim();
        if (!dni) return;

        bienvenidaEG.style.display = "none"; // Oculto el “Bienvenido a EG Gym”

        try {
            const res = await fetch(`${API_URL}/asistencias?dni=${dni}`);
            if (!res.ok) throw new Error("Servidor caído");

            const data = await res.json();

            // DNI no encontrado
            if (!data || data.error) {
                infoCard.style.display = "none";
                alertCuota.style.display = "none";
                document.getElementById("messages").innerHTML =
                    `<p class="alert-error">❌ DNI no encontrado</p>`;
                return;
            }

            mostrarDatos(data);
        } catch (error) {
            infoCard.style.display = "none";
            alertCuota.style.display = "none";

            document.getElementById("messages").innerHTML =
                `<p class="alert-error">❌ Error de conexión con el servidor</p>`;
        }
    });

    clearBtn.addEventListener("click", () => {
        dniInput.value = "";
        infoCard.style.display = "none";
        alertCuota.style.display = "none";
        document.getElementById("messages").innerHTML = "";
        bienvenidaEG.style.display = "block";
    });
});

function mostrarDatos(data) {
    const infoCard = document.getElementById("infoCard");
    const alertCuota = document.getElementById("alert-cuota");

    document.getElementById("messages").innerHTML = "";

    // ESTILOS SEGÚN EQUIPO
    if (data.equipo === "blanco") {
        infoCard.className = "card-blanco";
    } else {
        infoCard.className = "card-morado";
    }

    // Lleno la información
    document.getElementById("nombre").innerText = data.nombreCompleto;
    document.getElementById("equipo").innerText = data.equipo;
    document.getElementById("plan").innerText = data.plan;
    document.getElementById("asistencias").innerText =
        `${data.asistenciasSemana} / ${data.maximoSemana}`;

    // CUOTA VENCIDA
    if (data.estado === "Vencido") {
        alertCuota.style.display = "block";
        alertCuota.innerHTML = `⚠️ Tu cuota venció el día ${data.vencimiento}`;
    } else {
        alertCuota.style.display = "none";
    }

    // LÓGICA DE ASISTENCIAS
    if (data.asistenciasSemana >= data.maximoSemana) {
        document.getElementById("messages").innerHTML = `
            <p class="alert-warning">⚠️ Ya usaste tus ${data.maximoSemana} días permitidos esta semana.</p>
            <p class="alert-error">❌ No se registró la asistencia</p>
        `;
    } else {
        document.getElementById("messages").innerHTML = `
            <p style="color:#1aff1a; font-size:26px;">✔ Asistencia registrada correctamente</p>
        `;
    }

    infoCard.style.display = "block";
}
