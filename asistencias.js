// ===============================
// CONFIGURACIÓN
// ===============================
const API_URL = "https://gimnasio-online-1.onrender.com";

const dniInput = document.getElementById("dniInput");
const infoMensaje = document.getElementById("infoMensaje");
const asistenciaCard = document.getElementById("asistenciaCard");
const welcomeMain = document.getElementById("welcomeMain");
const cuotaBanner = document.getElementById("cuotaBanner");
const cuotaBannerText = document.getElementById("cuotaBannerText");
const btnBorrar = document.getElementById("btnBorrar");

const globalCuotasBanner = document.getElementById("globalCuotasVencidas");
const globalCuotasText = document.getElementById("globalCuotasText");

// ===============================
// BORRAR TODO
// ===============================
function borrarInfo() {
    dniInput.value = "";
    infoMensaje.textContent = "";
    asistenciaCard.classList.add("hidden");
    btnBorrar.classList.add("hidden");
    cuotaBanner.classList.add("hidden");
    welcomeMain.classList.remove("hidden");
    dniInput.focus();
}

// ===============================
// MOSTRAR ALERTA DE CUOTA VENCIDA
// ===============================
function mostrarCuotaVencida(fecha) {
    cuotaBannerText.textContent = `⚠ Tu cuota está vencida desde el ${fecha}`;
    cuotaBanner.classList.remove("hidden");
}

// ===============================
// ARMAR TARJETA DEL ALUMNO (VERSION NUEVA)
// ===============================
function armarTarjeta(data) {
    const alumno = data.alumno;
    const asistencias = data.asistencias_semana;
    const limite = data.limite_semanal ?? "-";

    // ===============================
    // ALERTAS PRIORITARIAS
    // ===============================
    let alertaHTML = "";

    // 1️⃣ Ya registró asistencia hoy
    if (data.alerta_dias?.includes("registraste")) {
        alertaHTML = `<div class="alert-warning">⚠ Ya registraste asistencia hoy</div>`;
    }
    // 2️⃣ Agotó su límite semanal
    else if (data.alerta_dias?.includes("agotaste")) {
        alertaHTML = `<div class="alert-warning">❗ Ya agotaste tus días de entrenamiento esta semana</div>`;
    }

    // 3️⃣ Cuota vencida
    let alertaCuotaHTML = "";
    if (data.alerta_cuota) {
        alertaCuotaHTML = `<div class="alert-error">⚠ Cuota vencida</div>`;
    }

    // ===============================
    // TARJETA COMPLETA
    // ===============================
    asistenciaCard.innerHTML = `
        <div class="bienvenida-inline">
            Bienvenido, <span class="nombre">${alumno.nombre}</span>
        </div>

        <div class="fila"><span class="label">Equipo:</span> ${alumno.equipo}</div>
        <div class="fila"><span class="label">Planes:</span> ${alumno.planes}</div>

        <div class="fila">
            <span class="label">Asistencias esta semana:</span>
            ${asistencias} / ${limite}
        </div>

        ${data.se_registro 
            ? `<div class="alert-info">✔ Asistencia registrada correctamente</div>` 
            : ""
        }

        ${alertaHTML}
        ${alertaCuotaHTML}
    `;

    // COLOR DE TARJETA SEGÚN EL EQUIPO
    asistenciaCard.classList.remove("card-blanco", "card-morado");
    asistenciaCard.classList.add(
        alumno.equipo.toLowerCase() === "blanco" ? "card-blanco" : "card-morado"
    );

    asistenciaCard.classList.remove("hidden");
    btnBorrar.classList.remove("hidden");
}

// ===============================
// REGISTRAR ASISTENCIA
// ===============================
async function registrarAsistencia() {
    const dni = dniInput.value.trim();
    if (!dni) return;

    welcomeMain.classList.add("hidden");
    infoMensaje.textContent = "";
    infoMensaje.classList.remove("error");
    asistenciaCard.classList.add("hidden");
    cuotaBanner.classList.add("hidden");

    try {
        const res = await fetch(`${API_URL}/asistencias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni })
        });

        const data = await res.json();

        if (!res.ok) {
            infoMensaje.textContent = "✖ DNI no encontrado o alumno inactivo";
            infoMensaje.classList.add("error");
            btnBorrar.classList.remove("hidden");
            return;
        }

        // Mostrar alerta de cuota vencida
        if (data.cuota && data.cuota.estado === "vencida") {
            mostrarCuotaVencida(data.cuota.fecha_vencimiento);
        }

        armarTarjeta(data);

    } catch (err) {
        console.error(err);
        infoMensaje.textContent = "✖ Error de conexión con el servidor";
        infoMensaje.classList.add("error");
        btnBorrar.classList.remove("hidden");
    }
}

// ===============================
// EVENTOS
// ===============================
dniInput.addEventListener("keydown", e => {
    if (e.key === "Enter") registrarAsistencia();
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});
