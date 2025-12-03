const API = "https://gimnasio-online-1.onrender.com";

const dniInput = document.getElementById("dniInput");
const card = document.getElementById("asistenciaCard");

/* ================================
   NUEVO MODAL WARNING (3D)
================================ */
const warningModal = document.getElementById("warningModal");
const warningText = document.getElementById("warningText");
const warningBtn = document.getElementById("warningBtn");

function abrirWarning(msg) {
    warningText.textContent = msg;
    warningModal.classList.remove("hidden");
}

function cerrarWarning() {
    warningModal.classList.add("hidden");
}

warningBtn.onclick = cerrarWarning;

/* ================================
   TARJETA DEL ALUMNO
================================ */
function armarTarjeta(data) {
    const a = data.alumno;

    const asistenciasSemana = Number(data.asistencias_semana ?? data.asistenciasSemana ?? 0);
    const limiteSemanal = Number(data.limite_semanal ?? data.limiteSemanal ?? 0);

    let planes = [];
    if (a.plan_eg) planes.push("Plan EG");
    if (a.plan_personalizado) planes.push("Personalizado");
    if (a.plan_running) planes.push("Running");
    if (planes.length === 0) planes.push("Sin plan");

    const fechaVto = a.fecha_vencimiento
        ? a.fecha_vencimiento.split("T")[0]
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
}

/* ================================
   BORRAR TARJETA
================================ */
function borrar() {
    dniInput.value = "";
    card.innerHTML = "";
    card.classList.add("hidden");
    dniInput.focus();
}

/* ================================
   ENTER PARA REGISTRAR ASISTENCIA
================================ */
dniInput.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;

    const dni = dniInput.value.trim();
    if (!dni) return;

    const res = await fetch(`${API}/asistencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni }),
    });

    const data = await res.json();
    console.log("RESPUESTA /asistencias:", data);

    if (!data.alumno) {
        abrirWarning("DNI no encontrado o alumno desactivado.");
        return;
    }

    // Mostrar tarjeta SIEMPRE
    armarTarjeta(data);

    // Lógica de avisos
    if (data.motivo === "vencido") {
        abrirWarning(data.mensaje);
        return;
    }

    if (data.motivo === "ya_registrado") {
        abrirWarning("Ya registraste asistencia hoy.");
        return;
    }

    if (data.motivo === "limite_semana") {
        abrirWarning("Ya superaste tu límite semanal.");
        return;
    }

    // OK
    abrirWarning("Asistencia registrada correctamente ✔");
});
