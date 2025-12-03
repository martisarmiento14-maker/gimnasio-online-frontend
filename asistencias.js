/* =====================================
   CONFIG
===================================== */
const API = "https://gimnasio-online-1.onrender.com";

const dniInput = document.getElementById("dniInput");
const infoBox = document.getElementById("asistenciaInfo");

/* =====================================
   MODALES
===================================== */

function abrirModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function cerrarModal(id) {
    document.getElementById(id).classList.add("hidden");
}

/* =====================================
   BORRAR TARJETA (LA FUNCIÓN DEBE ESTAR AFUERA)
===================================== */
function borrarInfo() {
    infoBox.classList.add("hidden");
    infoBox.innerHTML = "";
    dniInput.value = "";
    dniInput.focus();
}

/* =====================================
   MOSTRAR TARJETA DEL ALUMNO
===================================== */
function mostrarInfo(alumno, asis, limite) {
    const fechaVto = alumno.fecha_vencimiento
        ? alumno.fecha_vencimiento.split("T")[0]
        : "Sin fecha";

    let planes = [];
    if (alumno.plan_eg) planes.push("Plan EG");
    if (alumno.plan_running) planes.push("Running");
    if (alumno.plan_personalizado) planes.push("Personalizado");
    if (planes.length === 0) planes.push("Sin plan");

    infoBox.innerHTML = `
        <p><strong>Alumno:</strong> ${alumno.apellido} ${alumno.nombre}</p>
        <p><strong>Equipo:</strong> ${alumno.equipo ?? "-"}</p>
        <p><strong>Planes:</strong> ${planes.join(" + ")}</p>
        <p><strong>Asistencias esta semana:</strong> ${asis} / ${limite}</p>
        <p><strong>Fecha vencimiento:</strong> ${fechaVto}</p>

        <button class="asist-clear" onclick="borrarInfo()">Borrar</button>
    `;

    infoBox.classList.remove("hidden");
}

/* =====================================
   ENTER PARA REGISTRAR ASISTENCIA
===================================== */
dniInput.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;

    const dni = dniInput.value.trim();
    if (!dni) return;

    /* ====== REQ Real al backend ====== */
    const res = await fetch(`${API}/asistencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni }),
    });

    const data = await res.json();
    console.log("RESPUESTA /asistencias:", data);

    /* =====================================
       CASO 0: DNI NO EXISTE O DESACTIVADO
    ====================================== */
    if (!data.alumno) {
        abrirModal("modalVencido");
        document.querySelector("#modalVencido p").textContent =
            "DNI no encontrado o alumno desactivado.";
        return;
    }

    /* =====================================
       SIEMPRE MOSTRAR TARJETA
    ====================================== */
    const alumno = data.alumno;
    const asistencias = Number(data.asistencias_semana ?? 0);
    const limite = Number(data.limite_semanal ?? 0);

    mostrarInfo(alumno, asistencias, limite);

    /* =====================================
       CASO 1: YA REGISTRÓ HOY
    ====================================== */
    if (data.motivo === "ya_registrado") {
        abrirModal("modalYaVino");
        return;
    }

    /* =====================================
       CASO 2: CUOTA VENCIDA
    ====================================== */
    if (data.motivo === "vencido") {
        abrirModal("modalVencido");
        document.querySelector("#modalVencido p").textContent =
            data.mensaje ?? "Su cuota está vencida.";
        return;
    }

    /* =====================================
       CASO 3: LÍMITE SEMANAL
    ====================================== */
    if (data.motivo === "limite_semana") {
        abrirModal("modalCupos");
        return;
    }

    /* =====================================
       CASO 4: TODO OK → REGISTRAR ÉXITO
    ====================================== */
    abrirModal("modalExito");

    mostrarInfo(alumno, asistencias + 1, limite);
});
