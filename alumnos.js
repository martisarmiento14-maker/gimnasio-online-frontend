const API_URL = "https://gimnasio-online-1.onrender.com";

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

        // ------ CALCULAR ESTADO -------
        const hoy = new Date();
        const fechaVenc = new Date(a.fecha_vencimiento);

        let claseEstado = "";

        if (!a.fecha_vencimiento) {
            claseEstado = "fila-sin-cuota";
        } else if (fechaVenc < hoy) {
            claseEstado = "fila-vencido";
        } else {
            const diferencia = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));

            if (diferencia <= 5) {
                claseEstado = "fila-por-vencer";
            } else {
                claseEstado = "fila-al-dia";
            }
        }

        // APLICAR CLASE A LA FILA
        tr.classList.add(claseEstado);

        // ------ CONTENIDO --------
        tr.innerHTML = `
            <td>${a.nombre} ${a.apellido}</td>
            <td>${a.dni}</td>
            <td>${a.nivel}</td>
            <td>${a.equipo}</td>
            <td>${formatearPlanes(a)}</td>
            <td>${formatFecha(a.fecha_vencimiento)}</td>
            <td><button class="btn-edit" onclick="editarAlumno(${a.id})">Editar</button></td>
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

