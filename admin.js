// =========================
// CONFIG
// =========================
const API_URL = "https://gimnasio-online-1.onrender.com";

let listaAlumnosAdmin = [];
let adminPaginaActual = 1;
const adminPorPagina = 10;

// =========================
// CARGAR ALUMNOS AL INICIAR
// =========================
document.addEventListener("DOMContentLoaded", async () => {
    await cargarAlumnosAdmin();
});

// =========================
// OBTENER ALUMNOS
// =========================
async function cargarAlumnosAdmin() {
    try {
        const res = await fetch(`${API_URL}/admin`);
        listaAlumnosAdmin = await res.json();
        aplicarFiltrosAdmin();
    } catch (err) {
        console.error("ERROR AL CARGAR ADMIN:", err);
    }
}

// =========================
// FILTROS + BUSCADOR
// =========================
function aplicarFiltrosAdmin() {
    let filtrados = [...listaAlumnosAdmin];

    const texto = document.getElementById("buscadorAdmin").value.toLowerCase();
    const filtroEstado = document.getElementById("filtroEstadoAdmin").value;
    const filtroEquipo = document.getElementById("filtroEquipoAdmin").value;

    // Buscador
    filtrados = filtrados.filter(a =>
        a.nombre.toLowerCase().includes(texto) ||
        a.apellido.toLowerCase().includes(texto) ||
        a.dni.includes(texto)
    );

    // Filtro estado
    if (filtroEstado === "activos") filtrados = filtrados.filter(a => a.activo == 1);
    if (filtroEstado === "inactivos") filtrados = filtrados.filter(a => a.activo == 0);

    // Filtro equipo
    if (filtroEquipo !== "todos") filtrados = filtrados.filter(a => a.equipo === filtroEquipo);

    // Ordenar por vencimiento (vencidos arriba)
    filtrados.sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

    renderAdminPaginado(filtrados);
}

// =========================
// PAGINACIÓN ADMIN
// =========================
function renderAdminPaginado(lista) {
    const inicio = (adminPaginaActual - 1) * adminPorPagina;
    const fin = inicio + adminPorPagina;
    const pagina = lista.slice(inicio, fin);

    renderizarTablaAdmin(pagina);
    actualizarAdminPaginacion(lista.length);
}

function actualizarAdminPaginacion(totalItems) {
    const totalPaginas = Math.ceil(totalItems / adminPorPagina);
    const cont = document.getElementById("adminPagination");
    cont.innerHTML = "";

    if (totalPaginas <= 1) return;

    // <
    const prev = document.createElement("button");
    prev.textContent = "<";
    prev.onclick = () => {
        if (adminPaginaActual > 1) {
            adminPaginaActual--;
            aplicarFiltrosAdmin();
        }
    };
    cont.appendChild(prev);

    // números
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === adminPaginaActual) btn.classList.add("active");
        btn.onclick = () => {
            adminPaginaActual = i;
            aplicarFiltrosAdmin();
        };
        cont.appendChild(btn);
    }

    // >
    const next = document.createElement("button");
    next.textContent = ">";
    next.onclick = () => {
        if (adminPaginaActual < totalPaginas) {
            adminPaginaActual++;
            aplicarFiltrosAdmin();
        }
    };
    cont.appendChild(next);
}

// =========================
// RENDER TABLA (TU FUNCIÓN)
// =========================
function renderizarTablaAdmin(lista) {
    const tbody = document.getElementById("listaAdmin");
    tbody.innerHTML = "";

    lista.forEach(alumno => {
        const tr = document.createElement("tr");

        // --- COLOR POR ESTADO ---
        const hoy = new Date();
        const venc = new Date(alumno.fecha_vencimiento);

        if (alumno.activo == 0) tr.classList.add("fila-inactivo");
        else if (venc < hoy) tr.classList.add("fila-vencido");
        else if (venc - hoy < 3 * 24 * 60 * 60 * 1000) tr.classList.add("fila-por-vencer");
        else tr.classList.add("fila-al-dia");

        tr.innerHTML = `
            <td>${alumno.nombre}</td>
            <td>${alumno.apellido}</td>
            <td>${alumno.dni}</td>
            <td>${alumno.telefono}</td>
            <td>${alumno.nivel}</td>
            <td>${alumno.equipo ?? "-"}</td>
            <td>${new Date(alumno.fecha_vencimiento).toLocaleDateString()}</td>
            <td>
                <button onclick="toggleEstado(${alumno.id}, ${alumno.activo})" class="btn-edit">
                    ${alumno.activo == 1 ? "Desactivar" : "Activar"}
                </button>
                <button onclick="cambiarEquipo(${alumno.id})" class="btn-edit">Equipo</button>
                <button onclick="borrarAlumno(${alumno.id})" class="btn-delete">Borrar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// =========================
// ACCIONES (NO TOCADO)
// =========================
async function toggleEstado(id, estado) {
    const ruta = estado == 1 ? "desactivar" : "activar";
    await fetch(`${API_URL}/admin/${id}/${ruta}`, { method: "PUT" });
    cargarAlumnosAdmin();
}

async function cambiarEquipo(id) {
    const equipo = prompt("Nuevo equipo (morado/blanco):");
    if (!equipo) return;
    await fetch(`${API_URL}/admin/${id}/equipo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipo })
    });
    cargarAlumnosAdmin();
}

async function borrarAlumno(id) {
    if (!confirm("¿Seguro?")) return;
    await fetch(`${API_URL}/admin/${id}`, { method: "DELETE" });
    cargarAlumnosAdmin();
}
