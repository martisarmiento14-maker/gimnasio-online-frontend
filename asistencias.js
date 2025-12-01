// ===============================
// CONFIGURACIÓN
// ===============================
const API_URL = "https://gimnasio-online-1.onrender.com";  // Backend correcto

const dniInput = document.getElementById("dniInput");
const infoMensaje = document.getElementById("infoMensaje");
const asistenciaCard = document.getElementById("asistenciaCard");
const welcomeMain = document.getElementById("welcomeMain");
const cuotaBanner = document.getElementById("cuotaBanner");
const cuotaBannerText = document.getElementById("cuotaBannerText");
const btnBorrar = document.getElementById("btnBorrar");

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
// ARMAR TARJETA DEL ALUMNO
// ===============================
function armarTarjeta(data) {
    const alumno = data.alumno;
    const asistencias = data.asistencias_semana;
    const limite = data.limite_semanal ?? "-";
    const alertaDias = data.alerta_dias;
    const alertaCuota = data.alerta_cuota;
    const seRegistro = data.se_registro;

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

        ${
            seRegistro
                ? `<div class="alert-info">✔ Asistencia registrada correctamente</div>`
                : `<div class="alert-warning">⚠ Ya alcanzaste tu límite semanal</div>`
        }

        ${
            alertaDias
                ? `<div class="alert-warning">${alertaDias}</div>`
                : ""
        }

        ${
            alertaCuota
                ? `<div class="alert-error">${alertaCuota}</div>`
                : ""
        }
    `;

    // Aplicar estilo por equipo
    asistenciaCard.classList.remove("card-blanco", "card-morado");

    if (alumno.equipo.toLowerCase() === "blanco") {
        asistenciaCard.classList.add("card-blanco");
    } else {
        asistenciaCard.classList.add("card-morado");
    }

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
        // 🔥 PETICIÓN CORRECTA AL BACKEND REAL
        const res = await fetch(`${API_URL}/asistencias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni })
        });

        const data = await res.json();

        if (!res.ok) {
            infoMensaje.textContent = "✖ DNI no encontrado";
            infoMensaje.classList.add("error");
            btnBorrar.classList.remove("hidden");
            return;
        }

        // Si hay cuota y está vencida
        if (data.cuota && data.cuota.estado === "vencida") {
            mostrarCuotaVencida(data.cuota.fecha_vencimiento);
        }

        // Armar tarjeta
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
