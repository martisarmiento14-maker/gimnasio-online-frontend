// asistencias.js
const API = "https://gimnasio-online-1.onrender.com/asistencias";

document.getElementById("btnMarcar").addEventListener("click", registrar);

async function registrar() {
    const dni = document.getElementById("dni").value.trim();
    const resultado = document.getElementById("resultado");
    const sonidoOk = document.getElementById("sonidoOk");
    const sonidoError = document.getElementById("sonidoError");

    resultado.style.display = "none";

    if (dni === "") {
        sonidoError.play();
        mostrar("Debés ingresar un DNI", false);
        return;
    }

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni })
        });

        const data = await res.json();

        if (res.status === 404) {
            sonidoError.play();
            mostrar("Alumno no encontrado o inactivo", false);
            return;
        }

        if (data.se_registro) sonidoOk.play();
        else sonidoError.play();

        // Construir mensaje
        let html = `
            <div class="dato"><b>Alumno:</b> ${data.alumno.nombre} ${data.alumno.apellido}</div>
            <div class="dato"><b>DNI:</b> ${data.alumno.dni}</div>
            <div class="dato"><b>Equipo:</b> ${data.alumno.equipo}</div>
            <div class="dato"><b>Plan:</b> ${data.alumno.planes}</div>
            <div class="dato"><b>Asistencias esta semana:</b> ${data.asistencias_semana}/${data.limite_semanal}</div>
        `;

        // Cuota
        if (data.cuota) {
            if (data.cuota.estado === "vencida") {
                html += `<div class="alerta">⚠ Cuota VENCIDA (vencía ${data.cuota.fecha_vencimiento})</div>`;
            } else {
                html += `<div class="dato"><b>Cuota:</b> al día (${data.cuota.fecha_vencimiento})</div>`;
            }
        } else {
            html += `<div class="alerta">⚠ Sin cuota registrada</div>`;
        }

        // Alertas extra
        if (data.alerta_dias) {
            html += `<div class="alerta">${data.alerta_dias}</div>`;
        }

        if (data.alerta_cuota) {
            html += `<div class="alerta">${data.alerta_cuota}</div>`;
        }

        mostrar(html, data.se_registro);

    } catch (error) {
        console.error(error);
        sonidoError.play();
        mostrar("Error del servidor", false);
    }
}

function mostrar(msg, ok) {
    const resultado = document.getElementById("resultado");

    resultado.className = ok ? "ok" : "error";
    resultado.innerHTML = msg;
    resultado.style.display = "block";

    resultado.style.opacity = 0;
    setTimeout(() => resultado.style.opacity = 1, 30);
}
