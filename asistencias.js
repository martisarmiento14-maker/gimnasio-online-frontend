// =============================
//  Asistencias - FRONTEND
// =============================

// URL del backend en Render
const API_BASE = "https://gimnasio-online-1.onrender.com";

// Referencias al DOM
const dniInput = document.getElementById("dniInput");
const infoMensaje = document.getElementById("infoMensaje");
const asistenciaCard = document.getElementById("asistenciaCard");
const btnBorrar = document.getElementById("btnBorrar");
const welcomeMain = document.getElementById("welcomeMain");
const cuotaBanner = document.getElementById("cuotaBanner");
const cuotaBannerText = document.getElementById("cuotaBannerText");

// Pequeño helper
function limpiarCard() {
    asistenciaCard.innerHTML = "";
    asistenciaCard.classList.add("hidden");
}

function mostrarMensaje(texto, tipo = "error") {
    infoMensaje.textContent = texto || "";

    infoMensaje.classList.remove("error", "ok");
    if (tipo === "error") infoMensaje.classList.add("error");
    if (tipo === "ok") infoMensaje.classList.add("ok");
}

// Banner de cuota vencida
function mostrarCuotaVencida(texto) {
    if (!texto) {
        cuotaBanner.classList.add("hidden");
        cuotaBannerText.textContent = "";
        return;
    }

    cuotaBannerText.textContent = texto;
    cuotaBanner.classList.remove("hidden");

    // Ocultar después de unos segundos
    setTimeout(() => {
        cuotaBanner.classList.add("hidden");
    }, 4500);
}

// =============================
//  Registrar Asistencia
// =============================
async function registrarAsistencia() {
    const dni = dniInput.value.trim();
    mostrarCuotaVencida(null);

    if (!dni) {
        mostrarMensaje("Ingresá un DNI", "error");
        limpiarCard();
        btnBorrar.classList.add("hidden");
        return;
    }

    // Ocultamos el "Bienvenido a EG Gym" al buscar
    if (welcomeMain) {
        welcomeMain.classList.add("hidden");
    }

    mostrarMensaje("Buscando alumno...", "ok");
    limpiarCard();
    btnBorrar.classList.add("hidden");

    try {
        const res = await fetch(`${API_BASE}/asistencias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni }),
        });

        // Intentamos leer la respuesta (aunque no haya sido ok)
        let data = {};
        try {
            data = await res.json();
        } catch (e) {
            // si no es JSON, lo dejamos vacío
        }

        if (!res.ok) {
            // Errores específicos
            if (data && data.error) {
                mostrarMensaje(`✖ ${data.error}`, "error");
            } else if (res.status === 404) {
                mostrarMensaje("✖ DNI no encontrado", "error");
            } else {
                mostrarMensaje("✖ Error de servidor", "error");
            }
            limpiarCard();
            btnBorrar.classList.remove("hidden");
            return;
        }

        // -----------------------------
        //  ÉXITO: armamos la tarjeta
        // -----------------------------
        const {
            alumno,
            cuota,
            limite_semanal,
            asistencias_semana,
            alerta_cuota,
            alerta_dias,
            se_registro,
        } = data;

        if (!alumno) {
            mostrarMensaje("✖ No se encontró información del alumno", "error");
            limpiarCard();
            btnBorrar.classList.remove("hidden");
            return;
        }

        // Mostramos banner de cuota vencida (pero no bloquea asistencia)
        if (alerta_cuota) {
            mostrarCuotaVencida(alerta_cuota);
        } else {
            mostrarCuotaVencida(null);
        }

        // Color según equipo
        const equipo = (alumno.equipo || "").toLowerCase();
        asistenciaCard.classList.remove("card-blanco", "card-morado");

        if (equipo === "blanco") {
            asistenciaCard.classList.add("card-blanco");
        } else if (
            equipo === "morado" ||
            equipo === "violeta" ||
            equipo === "lila"
        ) {
            asistenciaCard.classList.add("card-morado");
        } else {
            // por defecto usamos esquema blanco
            asistenciaCard.classList.add("card-blanco");
        }

        // Texto de bienvenida + nombre
        const nombreCompleto = `${alumno.nombre || ""} ${
            alumno.apellido || ""
        }`.trim();

        // Armamos HTML de la tarjeta
        let html = `
            <div class="bienvenida-inline">
                <span class="label">Bienvenido,</span>
                <span class="nombre"> ${nombreCompleto.toLowerCase()} </span>
            </div>

            <p class="fila">
                <span class="label">Equipo:</span>
                &nbsp; ${alumno.equipo || "-"}
            </p>

            <p class="fila">
                <span class="label">Plan:</span>
                &nbsp; ${alumno.planes || alumno.plan || "-"}
            </p>
        `;

        if (limite_semanal) {
            html += `
                <p class="fila">
                    <span class="label">Asistencias esta semana:</span>
                    &nbsp; ${asistencias_semana || 0} / ${limite_semanal}
                </p>
            `;
        }

        if (alerta_dias) {
            html += `
                <p class="alert-warning">⚠ ${alerta_dias}</p>
            `;
        }

        // Mensaje principal de registro
        if (se_registro) {
            html += `
                <p class="alert-info">
                    ✔ Asistencia registrada correctamente.
                </p>
            `;
        } else {
            html += `
                <p class="alert-error">
                    ✖ No se registró la asistencia porque superaste tus días permitidos.
                </p>
            `;
        }

        asistenciaCard.innerHTML = html;
        asistenciaCard.classList.remove("hidden");
        mostrarMensaje("", "ok");
        btnBorrar.classList.remove("hidden");
    } catch (err) {
        console.error(err);
        mostrarMensaje("✖ Error de conexión con el servidor", "error");
        limpiarCard();
        btnBorrar.classList.remove("hidden");
    }
}

// =============================
//  Borrar / Reset
// =============================
function borrarInfo() {
    dniInput.value = "";
    mostrarMensaje("");
    limpiarCard();
    btnBorrar.classList.add("hidden");
    mostrarCuotaVencida(null);

    if (welcomeMain) {
        welcomeMain.classList.remove("hidden");
    }

    dniInput.focus();
}

// Hacer visibles las funciones globalmente
window.registrarAsistencia = registrarAsistencia;
window.borrarInfo = borrarInfo;
