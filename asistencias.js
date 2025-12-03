const API = "https://gimnasio-online-1.onrender.com";

const dniInput = document.getElementById("dniInput");
const card = document.getElementById("asistenciaCard");

const modalOverlay = document.getElementById("modalOverlay");
const modalText = document.getElementById("modalText");
const modalBtn = document.getElementById("modalBtn");

function abrirModal(msg) {
    modalText.textContent = msg;
    modalOverlay.classList.remove("hidden");
}

function cerrarModal() {
    modalOverlay.classList.add("hidden");
}
modalBtn.onclick = cerrarModal;

// -------- TARJETA CLARA + ANIMACIÓN --------
function armarTarjeta(data) {
    const a = data.alumno;

    // Soporta tanto camelCase como snake_case por si el back se mezcla
    const asistenciasSemana = Number(
        data.asistenciasSemana ?? data.asistencias_semana ?? 0
    );
    const limiteSemanal = Number(
        data.limiteSemanal ?? data.limite_semanal ?? a.dias_semana ?? 0
    );

    let planes = [];
    if (a.plan_eg) planes.push("Plan EG");
    if (a.plan_personalizado) planes.push("Personalizado");
    if (a.plan_running) planes.push("Running");
    if (planes.length === 0) planes.push("Sin plan");

    const fechaVto = a.fecha_vencimiento
        ? a.fecha_vencimiento.toString().split("T")[0]
        : "Sin fecha";

    card.innerHTML = `
        <h3>Alumno: <span>${a.nombre} ${a.apellido}</span></h3>
        <p><strong>Equipo:</strong> ${a.equipo ?? "-"}</p>
        <p><strong>Planes:</strong> ${planes.join(" + ")}</p>
        <p><strong>Asistencias esta semana:</strong> ${asistenciasSemana} / ${limiteSemanal}</p>
        <p><strong>Fecha vencimiento:</strong> ${fechaVto}</p>

        <button class="asist-clear" onclick="borrar()">Borrar</button>
    `;

    card.classList.remove("hidden");
    card.classList.add("animar");
}

function borrar() {
    dniInput.value = "";
    card.innerHTML = "";
    card.classList.add("hidden");
    dniInput.focus();
}

// -------- EVENTO ENTER --------
dniInput.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;

    const dni = dniInput.value.trim();
    if (!dni) return;

    try {
        const res = await fetch(`${API}/asistencias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni }),
        });

        const data = await res.json();
        console.log("RESPUESTA /asistencias:", data);

        // Si el backend devuelve error sin alumno
        if (!data.alumno) {
            abrirModal(data.error || "DNI no encontrado o alumno desactivado");
            return;
        }

        // 1️⃣ Mostrar tarjeta SIEMPRE con lo que venga
        armarTarjeta(data);

        // 2️⃣ Si el back manda un mensaje, lo usamos SIEMPRE
        if (data.mensaje) {
            abrirModal(data.mensaje);
            return;
        }

        // 3️⃣ Fallback por si algún caso no trae mensaje
        if (data.motivo === "limite_semana") {
            abrirModal("Ya superaste tu límite semanal.");
            return;
        }

        if (data.motivo === "ya_registrado") {
            abrirModal("Ya registraste asistencia hoy.");
            return;
        }

        if (data.motivo === "vencido") {
            abrirModal("⚠ Tu cuota está vencida.");
            return;
        }

        abrirModal("Operación realizada.");
    } catch (err) {
        console.error("ERROR FETCH /asistencias:", err);
        abrirModal("Error al conectar con el servidor.");
    }
});
