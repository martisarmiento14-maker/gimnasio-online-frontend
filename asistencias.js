const API_URL = "https://gimnasio-online-1.onrender.com";

const dniInput = document.getElementById("dniInput");
const infoContainer = document.getElementById("infoContainer");
const bienvenidaText = document.getElementById("bienvenida");
const borrarBtn = document.getElementById("borrarBtn");
const alertaContainer = document.getElementById("alertaContainer");

// Oculta la bienvenida al escribir
dniInput.addEventListener("input", () => {
    if (dniInput.value.trim() !== "") {
        bienvenidaText.style.display = "none";
    } else {
        bienvenidaText.style.display = "block";
        infoContainer.innerHTML = "";
        alertaContainer.innerHTML = "";
    }
});

// Buscar alumno al presionar ENTER
dniInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        buscarAlumno();
    }
});

// Función principal
async function buscarAlumno() {
    const dni = dniInput.value.trim();
    infoContainer.innerHTML = "";
    alertaContainer.innerHTML = "";

    if (!dni) return;

    try {
        // Traer alumno
        const respAlumno = await fetch(`${API_URL}/alumnos/${dni}`);
        const alumno = await respAlumno.json();

        if (!alumno || alumno.error) {
            mostrarError("❌ DNI no encontrado");
            return;
        }

        // Traer cuota
        const respCuota = await fetch(`${API_URL}/cuotas/${dni}`);
        const cuota = await respCuota.json();

        // Registrar asistencia
        const respAsis = await fetch(`${API_URL}/asistencias/registrar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni }),
        });

        const resultado = await respAsis.json();

        // TARJETA DE COLOR SEGÚN EQUIPO
        let colorFondo = alumno.equipo === "blanco" ? "rgba(255,255,255,0.15)" : "rgba(115,0,230,0.20)";
        let colorTexto = alumno.equipo === "blanco" ? "black" : "white";

        // ALERTA SI CUOTA ESTÁ VENCIDA
        if (cuota.estado === "Vencido") {
            mostrarAlerta(`⚠ Tu cuota venció el día ${cuota.vencimiento}`);
        }

        infoContainer.innerHTML = `
            <div class="tarjeta" style="background:${colorFondo}; color:${colorTexto}">
                <h2 style="font-size: 40px; margin-bottom: 15px;">
                    Bienvenido, <span style="color:#c58bff">${alumno.nombre}</span>
                </h2>

                <p><strong>Equipo:</strong> ${alumno.equipo}</p>
                <p><strong>Plan:</strong> ${alumno.plan}</p>
                <p><strong>Asistencias esta semana:</strong> ${resultado.asistencias_semana}</p>

                ${resultado.warning ? `<p class="warning">⚠ ${resultado.warning}</p>` : ""}
                ${resultado.error ? `<p class="error">❌ ${resultado.error}</p>` : ""}
                ${resultado.success ? `<p class="success">✔ ${resultado.success}</p>` : ""}
            </div>
        `;

        borrarBtn.style.display = "block";

    } catch (error) {
        mostrarError("❌ Error de conexión con el servidor");
    }
}

function mostrarError(msg) {
    alertaContainer.innerHTML = `
        <div class="alertaRoja">${msg}</div>
    `;
}

function mostrarAlerta(msg) {
    alertaContainer.innerHTML = `
        <div class="alertaAmarilla">${msg}</div>
    `;
}

borrarBtn.addEventListener("click", () => {
    dniInput.value = "";
    bienvenidaText.style.display = "block";
    infoContainer.innerHTML = "";
    alertaContainer.innerHTML = "";
    borrarBtn.style.display = "none";
});

