const API_URL = "https://gimnasio-online-1.onrender.com";
const dniInput = document.getElementById("dniInput");
const card = document.getElementById("card");
const popupAlert = document.getElementById("popupAlert");
const borrarBtn = document.getElementById("borrarBtn");
const welcomeText = document.getElementById("welcomeText");

// Mostrar popup
function showPopup(msg) {
    popupAlert.innerText = msg;
    popupAlert.style.display = "block";

    setTimeout(() => {
        popupAlert.style.display = "none";
    }, 3500);
}

function resetear() {
    dniInput.value = "";
    card.style.display = "none";
    borrarBtn.style.display = "none";
    welcomeText.style.display = "block";
}

// Verifica vencimiento
function estaVencido(fecha) {
    let hoy = new Date();
    let venc = new Date(fecha);

    return venc < hoy;
}

async function buscarAlumno() {
    let dni = dniInput.value.trim();
    if (dni.length < 7) return;

    welcomeText.style.display = "none";

    try {
        const resp = await fetch(`${API_URL}/asistencia/${dni}`);
        const data = await resp.json();

        borrarBtn.style.display = "block";

        if (!resp.ok) {
            card.style.display = "none";
            showPopup("❌ DNI no encontrado");
            return;
        }

        const alumno = data.alumno;
        const cuota = data.cuota;

        // =======================
        //   AVISO DE VENCIMIENTO
        // =======================
        if (cuota && estaVencido(cuota.vencimiento)) {
            showPopup(`⚠️ Tu cuota está vencida desde ${cuota.vencimiento}`);
        }

        // =======================
        //   TARJETA PERSONALIZADA
        // =======================
        if (alumno.equipo === "blanco") {
            card.className = "card white-card";
        } else {
            card.className = "card purple-card";
        }

        card.innerHTML = `
            <h1 style="font-size:2.8rem; color:black;">
                Bienvenido, <span style="color:#b47cff;">${alumno.nombre}</span>
            </h1>

            <p><b>Equipo:</b> ${alumno.equipo}</p>
            <p><b>Plan:</b> ${alumno.plan}</p>

            <p style="color:#821bff; font-size:1.6rem;">
                <b>Asistencias esta semana:</b> ${data.asistencias_semana}
            </p>

            ${data.alerta_dias ? 
                `<p class="warning">⚠ ${data.alerta_dias}</p>` : ""}

            ${data.alerta_asistencia ?
                `<p class="error">✖ ${data.alerta_asistencia}</p>` : ""}
        `;

        card.style.display = "block";

    } catch (error) {
        showPopup("❌ Error de conexión");
        console.error(error);
    }
}

