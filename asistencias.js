const dniInput = document.getElementById("dniInput");
const resultadoDiv = document.getElementById("resultado");
const subtituloGym = document.getElementById("subtituloGym");
const btnBorrar = document.getElementById("btnBorrar");

// esconder/mostrar "Bienvenido a EG Gym" según haya texto en DNI
document.addEventListener("DOMContentLoaded", () => {
    dniInput.addEventListener("input", () => {
        if (dniInput.value.trim() === "") {
            subtituloGym.style.display = "block";
        } else {
            subtituloGym.style.display = "none";
        }
    });
});

// ------------------------------
// FUNCIÓN PRINCIPAL: REGISTRAR ASISTENCIA
// ------------------------------
async function registrarAsistencia() {
    const dni = dniInput.value.trim();
    if (!dni) return;

    resultadoDiv.innerHTML = `<p style="font-size:22px;">Buscando alumno...</p>`;
    btnBorrar.style.display = "none";

    try {
        const res = await fetch(
            "https://gimnasio-backend-u3xo.onrender.com/asistencias",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni }),
            }
        );

        const data = await res.json();

        if (!res.ok || data.error) {
            mostrarError(data.error || "Error al registrar asistencia");
            return;
        }

        mostrarResultado(data);
    } catch (err) {
        console.error(err);
        mostrarError("Error de conexión con el servidor");
    }
}

// ------------------------------
// MOSTRAR ERROR SIMPLE
// ------------------------------
function mostrarError(mensaje) {
    resultadoDiv.innerHTML = `
        <div style="color:red; font-size:32px; margin-top:30px;">
            ✖ ${mensaje}
        </div>
    `;
    btnBorrar.style.display = "block";
}

// ------------------------------
// DIBUJAR TARJETA DE RESULTADO
// ------------------------------
function mostrarResultado(data) {
    const {
        alumno,
        cuota,
        limite_semanal,
        asistencias_semana,
        alerta_cuota,
        alerta_dias,
        se_registro,
    } = data;

    // clase según equipo
    let panelClass = "panel-blanco";
    let colorNombre = "#6a1bb0"; // violeta fuerte para equipo blanco

    if (
        alumno.equipo &&
        (alumno.equipo.toLowerCase() === "morado" ||
            alumno.equipo.toLowerCase() === "violeta")
    ) {
        panelClass = "panel-morado";
        colorNombre = "#c08aff";
    }

    let html = "";

    // cartel de cuota vencida (si viene alerta_cuota del backend)
    if (alerta_cuota) {
        html += `<div class="alerta-cuota">⚠ ${alerta_cuota}</div>`;
    }

    html += `
        <div class="asistencia-panel ${panelClass}">
            <h2 class="titulo-bienvenida">
                <span>Bienvenido, </span>
                <span class="nombre" style="color:${colorNombre};">
                    ${alumno.nombre} ${alumno.apellido}
                </span>
            </h2>

            <p style="font-size:26px;"><strong>Equipo:</strong> ${alumno.equipo || "-"}</p>
            <p style="font-size:26px;"><strong>Plan:</strong> ${alumno.planes || "-"}</p>
    `;

    if (limite_semanal) {
        html += `
            <p style="font-size:24px;">
                <strong>Asistencias esta semana:</strong>
                ${asistencias_semana} / ${limite_semanal}
            </p>
        `;
    }

    if (alerta_dias) {
        html += `<p class="msg-amarillo">⚠ ${alerta_dias}</p>`;
    }

    if (se_registro) {
        html += `<p class="msg-verde">✔ Asistencia registrada correctamente</p>`;
    } else {
        html += `<p class="msg-rojo">✖ No se registró la asistencia porque superaste tus días permitidos.</p>`;
    }

    html += `</div>`;

    resultadoDiv.innerHTML = html;
    btnBorrar.style.display = "block";
}

// ------------------------------
// BOTÓN BORRAR
// ------------------------------
function borrarInfo() {
    dniInput.value = "";
    resultadoDiv.innerHTML = "";
    btnBorrar.style.display = "none";
    subtituloGym.style.display = "block";
    dniInput.focus();
}
