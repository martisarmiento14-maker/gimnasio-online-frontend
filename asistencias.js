const API_URL = "https://gimnasio-online-1.onrender.com/asistencias";

const dniInput = document.getElementById("dniInput");
const resultadoContenedor = document.getElementById("resultado");
const borrarBtn = document.getElementById("borrarBtn");
const bienvenida = document.getElementById("bienvenida");

// Mostrar bienvenida antes de ingresar DNI
resultadoContenedor.innerHTML = "";
borrarBtn.style.display = "none";

dniInput.addEventListener("input", async () => {
    const dni = dniInput.value.trim();

    if (dni === "") {
        bienvenida.style.display = "block";
        resultadoContenedor.innerHTML = "";
        borrarBtn.style.display = "none";
        return;
    }

    bienvenida.style.display = "none";

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni })
        });

        if (!res.ok) {
            throw new Error("Servidor caído o sin conexión");
        }

        const data = await res.json();

        resultadoContenedor.innerHTML = "";
        borrarBtn.style.display = "block";

        // ❌ DNI NO ENCONTRADO
        if (data.error) {
            mostrarError("DNI no encontrado");
            return;
        }

        // 📌 Mostrar tarjeta principal
        mostrarTarjeta(data);

        // ⚠️ Alerta de cuota vencida
        if (data.cuota && data.cuota.estado === "vencida") {
            mostrarAlertaCuota(data.cuota.fecha_vencimiento);
        }

    } catch (e) {
        mostrarError("Error de conexión con el servidor");
    }
});

function mostrarTarjeta(data) {
    const equipo = data.alumno.equipo.toLowerCase();
    const esMorado = equipo === "morado";

    const bgColor = esMorado
        ? "rgba(90,0,120,0.55)"
        : "rgba(255,255,255,0.50)";

    const textColor = esMorado ? "white" : "black";
    const nombreColor = esMorado ? "#d49bff" : "#6a00a8";

    resultadoContenedor.innerHTML = `
        <div class="tarjeta" style="background:${bgColor}; color:${textColor}">
            <h2 style="color:${nombreColor}">
                Bienvenido, ${data.alumno.nombre} ${data.alumno.apellido}
            </h2>

            <p><strong>Equipo:</strong> ${data.alumno.equipo}</p>
            <p><strong>Plan:</strong> ${data.alumno.planes}</p>
            <p><strong>Asistencias esta semana:</strong> 
                ${data.asistencias_semana} / ${data.limite_semanal}
            </p>

            ${data.alerta_dias ? `
                <p style="color:yellow; font-size:1.4rem">
                    ⚠️ ${data.alerta_dias}
                </p>
            ` : ""}

            ${data.se_registro
                ? `<p style="color:#00ff38; font-size:1.5rem">✔ Asistencia registrada correctamente</p>`
                : `<p style="color:red; font-size:1.5rem">✘ No se registró la asistencia</p>`
            }
        </div>
    `;
}

function mostrarAlertaCuota(fecha) {
    const alerta = document.createElement("div");
    alerta.className = "alerta-cuota";
    alerta.innerHTML = `
        ⚠️ <strong>CUOTA VENCIDA</strong><br>
        Venció el <strong>${new Date(fecha).toLocaleDateString("es-AR")}</strong>.
    `;
    document.body.prepend(alerta);

    setTimeout(() => alerta.remove(), 7000);
}

function mostrarError(msg) {
    resultadoContenedor.innerHTML = `
        <p style="color:red; font-size:2rem; text-align:center">
            ✘ ${msg}
        </p>
    `;
    borrarBtn.style.display = "block";
}

borrarBtn.addEventListener("click", () => {
    dniInput.value = "";
    resultadoContenedor.innerHTML = "";
    borrarBtn.style.display = "none";
    bienvenida.style.display = "block";
});
