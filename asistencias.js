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
        const res = await fetch("https://gimnasio-online-1.onrender.com/asistencias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni }),
        });

        const data = await res.json();

        if (data.error) {
            info.innerHTML = `<p style="color:red;">${data.error}</p>`;
            sonarError();
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

        // Color equipo
        let claseEquipo = "asistencia-card-blanco";
        if (
            alumno.equipo &&
            ["violeta", "morado", "lila"].includes(alumno.equipo.toLowerCase())
        ) {
            claseEquipo = "asistencia-card-violeta";
        }

        let html = `
        <div class="asistencia-panel ${claseEquipo}">
            <h3>${alumno.nombre} ${alumno.apellido}</h3>
            <p><strong>DNI:</strong> ${alumno.dni}</p>
            <p><strong>Nivel:</strong> ${alumno.nivel}</p>
            <p><strong>Equipo:</strong> ${alumno.equipo || "-"}</p>
            <p><strong>Planes:</strong> ${alumno.planes || "-"}</p>
        `;

        if (limite_semanal) {
            html += `
            <p><strong>Asistencias esta semana:</strong> 
                ${asistencias_semana}/${limite_semanal}
            </p>`;
        }

        if (cuota) {
            html += `
            <p><strong>Cuota vence:</strong> 
                ${formatearFecha(cuota.fecha_vencimiento)}
            </p>`;
        } else {
            html += `<p><strong>Cuota:</strong> No registrada</p>`;
        }

        if (alerta_cuota) html += `<p class="alerta-roja">⚠ ${alerta_cuota}</p>`;
        if (alerta_dias) html += `<p class="alerta-roja">⚠ ${alerta_dias}</p>`;

        if (se_registro) {
            html += `<p class="ok-verde">✔ Asistencia registrada correctamente</p>`;
            sonarOK();
        } else {
            html += `<p class="alerta-roja">⚠ No se registró asistencia</p>`;
            sonarError();
        }

        html += `</div>`;

        info.innerHTML = html;
        btnBorrar.style.display = "inline-block";

        dniInput.value = "";
        dniInput.focus();

    } catch (err) {
        console.error(err);
        sonarError();
        info.innerHTML = `<p style="color:red;">Error de conexión con el servidor</p>`;
    }
}

function borrarInfo() {
    dniInput.value = "";
    info.innerHTML = "";
    btnBorrar.style.display = "none";
    dniInput.focus();
}

function sonarOK() {
    const audio = document.getElementById("sonidoOk");
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

function sonarError() {
    const audio = document.getElementById("sonidoError");
    audio.currentTime = 0;
    audio.play().catch(() => {});
}


