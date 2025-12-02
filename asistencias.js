const API_URL = "https://gimnasio-online-1.onrender.com";

const dniInput = document.getElementById("dniInput");
const infoMensaje = document.getElementById("infoMensaje");
const asistenciaCard = document.getElementById("asistenciaCard");
const welcomeMain = document.getElementById("welcomeMain");
const cuotaBanner = document.getElementById("cuotaBanner");
const cuotaBannerText = document.getElementById("cuotaBannerText");
const btnBorrar = document.getElementById("btnBorrar");

function borrarInfo() {
    dniInput.value = "";
    infoMensaje.textContent = "";
    asistenciaCard.classList.add("hidden");
    btnBorrar.classList.add("hidden");
    cuotaBanner.classList.add("hidden");
    welcomeMain.classList.remove("hidden");
    dniInput.focus();
}

// 💛 Mostrar alerta de cuota vencida
function mostrarCuotaVencida(texto) {
    cuotaBannerText.textContent = texto;
    cuotaBanner.classList.remove("hidden");
}

// 🟪 Construir tarjeta visual del alumno
function armarTarjeta(data) {
    const alumno = data.alumno;
    const asistencias = data.asistencias_semana;
    const limite = data.limite_semanal;
    
    let alertaDias = data.alerta_dias || "";
    let alertaCuota = data.alerta_cuota || "";
    let seRegistro = data.se_registro;

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

        ${alertaDias ? `<div class="alert-warning">${alertaDias}</div>` : ""}
        ${alertaCuota ? `<div class="alert-error">${alertaCuota}</div>` : ""}
    `;

    asistenciaCard.classList.remove("card-blanco", "card-morado");
    asistenciaCard.classList.add(
        alumno.equipo?.toLowerCase() === "blanco" ? "card-blanco" : "card-morado"
    );

    asistenciaCard.classList.remove("hidden");
    btnBorrar.classList.remove("hidden");
}

// 🟩 Registrar asistencia
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

        if (!res.ok || data.error) {
            infoMensaje.textContent = "✖ DNI no encontrado";
            infoMensaje.classList.add("error");
            btnBorrar.classList.remove("hidden");
            return;
        }

        // 💛 Mostrar alerta cuota vencida
        if (data.alerta_cuota) {
            mostrarCuotaVencida(data.alerta_cuota);
        }

        // 🎨 Mostrar tarjeta completa SIEMPRE (opción 1)
        armarTarjeta(data);

    } catch (err) {
        console.error(err);
        infoMensaje.textContent = "✖ Error de conexión con el servidor";
        infoMensaje.classList.add("error");
        btnBorrar.classList.remove("hidden");
    }
}

// Eventos
dniInput.addEventListener("keydown", e => {
    if (e.key === "Enter") registrarAsistencia();
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});
