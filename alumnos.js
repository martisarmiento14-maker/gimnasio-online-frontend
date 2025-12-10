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

    // 🔍 BUSCADOR FUNCIONANDO
    const inputBuscador = document.getElementById("buscador");
    if (inputBuscador) {
        inputBuscador.addEventListener("input", () => {
            alumnosPaginaActual = 1;
            aplicarFiltrosAlumnos();
        });
    }
});

// =========================
// CARGAR ALUMNOS ACTIVOS
// =========================
async function cargarAlumnos() {
    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const data = await res.json();

        // Solo alumnos activos
        listaAlumnos = data.filter(a => a.activo == 1);

        aplicarFiltrosAlumnos();

    } catch (err) {
        console.error("ERROR ALUMNOS:", err);
    }
}

// =========================
// FILTROS + ORDEN ALFABÉTICO
// =========================
function aplicarFiltrosAlumnos() {
    let filtrados = [...listaAlumnos];

    const texto = document.getElementById("buscador").value.toLowerCase();

    filtrados = filtrados.filter(a =>
        a.nombre.toLowerCase().includes(texto) ||
        a.apellido.toLowerCase().includes(texto) ||
        a.dni.includes(texto)
    );

    // 🔥 ORDENAR POR APELLIDO → NOMBRE (orden profesional)
    filtrados.sort((a, b) => {
        const apA = a.apellido.toLowerCase();
        const apB = b.apellido.toLowerCase();
        const nomA = a.nombre.toLowerCase();
        const nomB = b.nombre.toLowerCase();

        if (apA !== apB) return apA.localeCompare(apB);
        return nomA.localeCompare(nomB);
    });

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

    // Botón anterior
    const prev = document.createElement("button");
    prev.textContent = "<";
    prev.onclick = () => {
        if (alumnosPaginaActual > 1) {
            alumnosPaginaActual--;
            aplicarFiltrosAlumnos();
        }
    };
    cont.appendChild(prev);

    // Mostrar solo primeras 10 páginas
    const maxPaginas = 10;
    const limite = Math.min(totalPaginas, maxPaginas);

    for (let i = 1; i <= limite; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === alumnosPaginaActual) btn.classList.add("active");
        btn.onclick = () => {
            alumnosPaginaActual = i;
            aplicarFiltrosAlumnos();
        };
        cont.appendChild(btn);
    }

    // Mostrar "..." si hay más páginas
    if (totalPaginas > maxPaginas) {
        const puntos = document.createElement("button");
        puntos.textContent = "...";
        puntos.disabled = true;
        cont.appendChild(puntos);
    }

    // Botón siguiente
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
// FORMATEAR FECHA SIN ERROR DE ZONA HORARIA
// =========================
function formatearFecha(fechaCruda) {
    if (!fechaCruda) return "-";

    const soloFecha = fechaCruda.split("T")[0];
    const [y, m, d] = soloFecha.split("-");

    return `${d}/${m}/${y}`;
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
            ? formatearFecha(alumno.fecha_vencimiento)
            : "-";

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${alumno.apellido} ${alumno.nombre}</td>
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

// =========================
// EDITAR ALUMNO
// =========================
function editarAlumno(id) {
    window.location.href = `form-alumno.html?editar=${id}`;
}
