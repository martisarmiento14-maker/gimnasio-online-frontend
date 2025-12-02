const API_URL = "https://gimnasio-online.onrender.com";

const tablaBody = document.getElementById("tablaAlumnosBody");
const buscador = document.getElementById("buscador");

// Cargar listado inicial
document.addEventListener("DOMContentLoaded", cargarAlumnos);

// Buscar por nombre o DNI
buscador.addEventListener("input", cargarAlumnos);

/* ─────────────────────────────── */
/* 🔹 Formatear planes (como tu foto) */
/* ─────────────────────────────── */
function formatearPlanes(a) {
    let planes = [];

    if (a.plan_eg) planes.push(`Plan EG (${a.dias_eg_pers} días/sem)`);
    if (a.plan_personalizado) planes.push(`Personalizado (${a.dias_eg_pers} días/sem)`);
    if (a.plan_running) planes.push(`Running (2 días/sem)`);

    return planes.join(" + ");
}

/* ─────────────────────────────── */
/* 🔹 Formato fecha DD/MM/YYYY */
/* ─────────────────────────────── */
function formatFecha(f) {
    return new Date(f).toLocaleDateString("es-AR");
}

/* ─────────────────────────────── */
/* 🔹 Cargar alumnos */
/* ─────────────────────────────── */
async function cargarAlumnos() {
    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const data = await res.json();

        let txt = buscador.value.toLowerCase();

        let filtrados = data.filter(a =>
            a.nombre.toLowerCase().includes(txt) ||
            a.apellido.toLowerCase().includes(txt) ||
            String(a.dni).includes(txt)
        );

        mostrarTabla(filtrados);

    } catch (error) {
        console.log("Error cargando alumnos:", error);
    }
}

/* ─────────────────────────────── */
/* 🔹 Mostrar tabla */
/* ─────────────────────────────── */
function mostrarTabla(lista) {
    tablaBody.innerHTML = "";

    lista.forEach(a => {
        const tr = document.createElement("tr");
        
        const color = a.equipo === "morado" ? "#e5ccff" : "#ffffff";

        tr.innerHTML = `
            <td style="background:${color}">${a.nombre}<br>${a.apellido}</td>
            <td style="background:${color}">${a.dni}</td>
            <td style="background:${color}">${a.nivel}</td>
            <td style="background:${color}">${a.equipo}</td>
            <td style="background:${color}">${formatearPlanes(a)}</td>
            <td style="background:${color}">${formatFecha(a.fecha_vencimiento)}</td>

            <td style="background:${color}">
                <button class="btn-editar" onclick="editarAlumno(${a.id})">Editar</button>
            </td>
        `;

        tablaBody.appendChild(tr);
    });
}

/* ─────────────────────────────── */
/* 🔹 Ir a editar */
/* ─────────────────────────────── */
function editarAlumno(id) {
    window.location.href = `form-alumno.html?editar=${id}`;
}

