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
    cuotaBannerText.textContent = `Tu cuota está vencida desde el ${fecha}`;
    cuotaBanner.classList.remove("hidden");
}

// ===============================
// ARMAR TARJETA DEL ALUMNO
// ===============================
function armarTarjeta(alumno, asistencia) {
    asistenciaCard.innerHTML = `
        <div class="bienvenida-inline">
            Bienvenido, <span class="nombre">${alumno.nombre.toLowerCase()}</span>
        </div>

        <div class="fila"><span class="label">Equipo:</span> ${alumno.equipo}</div>
        <div class="fila"><span class="label">Plan:</span> ${alumno.plan}</div>
        <div class="fila"><span class="label">Asistencias esta semana:</span> 
            ${asistencia.usadas} / ${asistencia.limite}
        </div>

        ${asistencia.advertencia
            ? `<div class="alert-warning">⚠ ${asistencia.advertencia}</div>`
            : ""
        }

        ${asistencia.error
            ? `<div class="alert-error">✖ ${asistencia.error}</div>`
            : ""
        }

        ${asistencia.ok
            ? `<div class="alert-info">✔ ${asistencia.ok}</div>`
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
    asistenciaCard.classList.add("hidden");
    cuotaBanner.classList.add("hidden");

    try {
        const res = await fetch(`${API_URL}/asistencias/registrar/${dni}`);
        const data = await res.json();

        if (!res.ok) {
            infoMensaje.textContent = "✖ DNI no encontrado";
            infoMensaje.classList.add("error");
            btnBorrar.classList.remove("hidden");
            return;
        }

        infoMensaje.textContent = "";

        // CUOTA VENCIDA
        if (data.cuotaVencida) {
            mostrarCuotaVencida(data.cuotaFecha);
        }

        // ARMAR TARJETA
        armarTarjeta(data.alumno, data.asistencia);

    } catch (err) {
        console.log(err);
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
