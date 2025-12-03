// =========================
// CONFIG
// =========================
const API_URL = "https://gimnasio-online-1.onrender.com";

let listaAlumnos = [];
let alumnosPaginaActual = 1;
const alumnosPorPagina = 10;

// =========================
// CARGAR AL INICIAR
// =========================
document.addEventListener("DOMContentLoaded", async () => {
    await cargarAlumnos();
});

// =========================
// CARGAR ALUMNOS ACTIVOS
// =========================
async function cargarAlumnos() {
    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const data = await res.json();

        listaAlumnos = data.filter(a => a.activo == 1);

        aplicarFiltrosAlumnos();

    } catch (err) {
        console.error("ERROR ALUMNOS:", err);
    }
}

// =========================
// FILTROS + BUSCADOR
// =========================
function aplicarFiltrosAlumnos() {
    let filtrados = [...listaAlumnos];

    const texto = document.getElementById("buscador").value.toLowerCase();

    filtrados = filtrados.filter(a =>
        a.nombre.toLowerCase().includes(texto) ||
        a.apellido.toLowerCase().includes(texto) ||
        a.dni.includes(texto)
    );

    renderAlumnosPaginado(filtrados);
}

// =========================
// PAGINACIÓN
// =========================
function renderAlumnosPaginado(lista) {
    const inicio = (alumnosPaginaActual - 1) * alumnosPorPagina;
    const fin = inicio + alumnosPorPagina;
    const pagina = lista.slice(inicio, fin);

    renderTablaAlumnos(pagina);
    actualizarPaginacionAlumnos(lista.length);
}

function actualizarPaginacionAlumnos(totalItems) {
    const totalPaginas = Math.ceil(totalItems / alumnosPorPagina);
    const cont = document.getElementById("alumnosPagination");
    cont.innerHTML = "";

    if (totalPaginas <= 1) return;

    const prev = document.createElement("button");
    prev.textContent = "<";
    prev.onclick = () => {
        if (alumnosPaginaActual > 1) {
            alumnosPaginaActual--;
            aplicarFiltrosAlumnos();
        }
    };
    cont.appendChild(prev);

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === alumnosPaginaActual) btn.classList.add("active");
        btn.onclick = () => {
            alumnosPaginaActual = i;
            aplicarFiltrosAlumnos();
        };
        cont.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = ">";
    next.onclick = () => {
        if (alumnosPaginaActual < totalPaginas) {
            alumnosPaginaActual++;
            aplicarFiltrosAlumnos();
        }
    };
    cont.appendChild(next);
}

// =========================
// RENDER TABLA
// =========================
function renderTablaAlumnos(lista) {
    const tbody = document.getElementById("listaAlumnos");
    tbody.innerHTML = "";

    lista.forEach(alumno => {
        
        const planes = [
            alumno.plan_eg ? "EG" : "",
            alumno.plan_personalizado ? "Personalizado" : "",
            alumno.plan_running ? "Running" : "",
        ].filter(Boolean).join(", ");

        const fecha = alumno.fecha_vencimiento
            ? new Date(alumno.fecha_vencimiento).toLocaleDateString("es-AR")
            : "-";

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${alumno.nombre} ${alumno.apellido}</td>
            <td>${alumno.dni}</td>
            <td>${alumno.nivel}</td>
            <td>${alumno.equipo}</td>
            <td>${planes}</td>
            <td>${fecha}</td>
            <td>
                <button class="btn-edit" onclick="editarAlumno(${alumno.id})">Editar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

