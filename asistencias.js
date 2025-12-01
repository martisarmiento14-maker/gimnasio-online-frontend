const info = document.getElementById("infoAlumno");
const dniInput = document.getElementById("dniInput");
const btnBorrar = document.getElementById("btnBorrar");

function formatearFecha(iso) {
    if (!iso) return "-";
    const f = new Date(iso);
    const d = String(f.getDate()).padStart(2, "0");
    const m = String(f.getMonth() + 1).padStart(2, "0");
    const y = f.getFullYear();
    return `${d}/${m}/${y}`;
}

async function registrarAsistencia() {
    const dni = dniInput.value.trim();
    info.innerHTML = "";

    if (!dni) {
        info.innerHTML = `<p style="color:red;">Ingresá un DNI</p>`;
        return;
    }

    info.innerHTML = `<p>Buscando alumno...</p>`;

    try {
        const res = await fetch("https://gimnasio-backend-u3xo.onrender.com/asistencias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            info.innerHTML = `<p style="color:red;">${data.error || "Error al registrar asistencia"}</p>`;
            return;
        }

        const {
            alumno,
            cuota,
            limite_semanal,
            asistencias_semana,
            alerta_cuota,
            alerta_dias,
            se_registro,
        } = data;

        // Cambiar color según equipo
        let claseEquipo = "asistencia-card-blanco";
        if (
            alumno.equipo &&
            (alumno.equipo.toLowerCase() === "violeta" ||
             alumno.equipo.toLowerCase() === "morado")
        ) {
            claseEquipo = "asistencia-card-violeta";
        }

        // Construir HTML
        let html = `
        <div class="asistencia-panel ${claseEquipo}">
            <h3>${alumno.nombre} ${alumno.apellido}</h3>
            <p><strong>Equipo:</strong> ${alumno.equipo || "-"}</p>
            <p><strong>Plan:</strong> ${alumno.planes}</p>
        `;

        if (limite_semanal) {
            html += `
            <p><strong>Asistencias esta semana:</strong> 
                ${asistencias_semana} / ${limite_semanal}
            </p>`;
        }

        if (cuota) {
            html += `
            <p><strong>Cuota vence:</strong> 
                ${formatearFecha(cuota.fecha_vencimiento)}
            </p>`;
        } else {
            html += `<p><strong>Cuota:</strong> Sin datos</p>`;
        }

        if (alerta_dias) {
            html += `<p class="alerta-roja">⚠ ${alerta_dias}</p>`;
        }

        if (alerta_cuota) {
            html += `<p class="alerta-roja">⚠ ${alerta_cuota}</p>`;
        }

        if (se_registro) {
            html += `<p class="ok-verde">✔ Asistencia registrada correctamente</p>`;
        } else {
            html += `<p class="ok-verde">ℹ No se registró la asistencia porque superaste tus días permitidos.</p>`;
        }

        html += `</div>`;

        info.innerHTML = html;
        btnBorrar.style.display = "inline-block";
        dniInput.value = "";
        dniInput.focus();

    } catch (err) {
        console.error(err);
        info.innerHTML = `<p style="color:red;">Error de conexión con el servidor</p>`;
    }
}

function borrarInfo() {
    dniInput.value = "";
    info.innerHTML = "";
    btnBorrar.style.display = "none";
    dniInput.focus();
}
