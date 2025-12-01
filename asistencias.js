const dniInput = document.getElementById("dniInput");
const info = document.getElementById("infoAlumno");
const btnBorrar = document.getElementById("btnBorrar");
const bienvenidaInicial = document.getElementById("bienvenidaInicial");
const alertaVencido = document.getElementById("alertaVencido");

async function registrarAsistencia() {
    const dni = dniInput.value.trim();
    if (!dni) return;

    bienvenidaInicial.style.display = "none";
    info.innerHTML = `<p style="color: yellow; font-size: 22px;">Buscando alumno...</p>`;

    try {
        const res = await fetch("https://gimnasio-backend-u3xo.onrender.com/asistencias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            info.innerHTML = `<p style="color:red; font-size:30px;">✖ ${data.error || "Error de conexión"}</p>`;
            sonarError();
            btnBorrar.style.display = "block";
            return;
        }

        mostrarTarjeta(data);

    } catch (err) {
        info.innerHTML = `<p style="color:red; font-size:30px;">✖ Error de conexión con el servidor</p>`;
        sonarError();
    }

    btnBorrar.style.display = "block";
}

function mostrarTarjeta(data) {
    const {
        alumno,
        asistencias_semana,
        limite_semanal,
        se_registro,
        alerta_cuota,
        alerta_dias,
        cuota
    } = data;

    info.innerHTML = "";
    alertaVencido.style.display = "none";

    // ⚠ Mostrar advertencia de cuota vencida arriba
    if (cuota && cuota.estado === "Vencido") {
        alertaVencido.style.display = "block";
        alertaVencido.innerHTML = `
            ⚠ <b>Tu cuota está vencida</b><br>
            Venció el: <b>${formatearFecha(cuota.fecha_vencimiento)}</b>.
        `;
    }

    // colores según equipo
    const esMorado = alumno.equipo.toLowerCase() === "morado";

    const tarjetaStyle = esMorado
        ? `background: rgba(88, 0, 139, 0.45); color: white; border: 4px solid #b57bff;`
        : `background: rgba(255,255,255,0.65); color: black; border: 4px solid #d2b4ff;`;

    const tituloColor = esMorado ? "#d9b3ff" : "black";
    const nombreColor = esMorado ? "#e0b3ff" : "#7b3fe0";

    let html = `
    <div class="tarjeta" style="${tarjetaStyle}">
        <h2 style="font-size:40px; color:${tituloColor};">
            Bienvenido, <span style="color:${nombreColor};">${alumno.nombre} ${alumno.apellido}</span>
        </h2>

        <p><b>Equipo:</b> ${alumno.equipo}</p>
        <p><b>Plan:</b> ${alumno.planes}</p>

        <p style="font-size:26px; margin-top:20px;">
            <b>Asistencias esta semana:</b> ${asistencias_semana} / ${limite_semanal}
        </p>
    `;

    if (alerta_dias) {
        html += `<p style="color:yellow; font-size:26px;">⚠ ${alerta_dias}</p>`;
    }

    if (alerta_cuota) {
        html += `<p style="color:red; font-size:26px;">✖ ${alerta_cuota}</p>`;
    }

    if (se_registro) {
        html += `<p style="color:#00ff00; font-size:30px;">✔ Asistencia registrada correctamente</p>`;
        sonarOK();
    } else if (!alerta_cuota && !alerta_dias) {
        html += `<p style="color:red; font-size:30px;">✖ No se registró la asistencia</p>`;
        sonarError();
    }

    html += `</div>`;
    info.innerHTML = html;
}

function borrarInfo() {
    dniInput.value = "";
    info.innerHTML = "";
    alertaVencido.style.display = "none";
    btnBorrar.style.display = "none";
    bienvenidaInicial.style.display = "block";
    dniInput.focus();
}

function sonarOK() {
    const a = document.getElementById("sonidoOk");
    a.currentTime = 0;
    a.play().catch(()=>{});
}

function sonarError() {
    const a = document.getElementById("sonidoError");
    a.currentTime = 0;
    a.play().catch(()=>{});
}

function formatearFecha(f) {
    const date = new Date(f);
    return date.toLocaleDateString("es-AR");
}
