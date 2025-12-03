const API = "https://gimnasio-online-1.onrender.com/admin";

const tbody = document.getElementById("tbodyAdmin");
const buscador = document.getElementById("buscador");
const filtroEquipo = document.getElementById("filtroEquipo");
const filtroEstado = document.getElementById("filtroEstado");
const paginacion = document.getElementById("paginacion"); // ← NUEVO

let alumnos = [];
let paginaActual = 1;
const porPagina = 10;

// ==================================
//      CARGAR ALUMNOS
// ==================================
async function cargarAlumnos() {
    const res = await fetch(API);
    alumnos = await res.json();
    paginaActual = 1;
    renderTabla();
}
cargarAlumnos();

// ==================================
//      FILTROS + PAGINACIÓN
// ==================================
function obtenerFiltrados() {
    const texto = buscador.value.toLowerCase();

    let filtrados = alumnos.filter(a => {
        const coincideTexto =
            (a.nombre + " " + a.apellido + " " + a.dni).toLowerCase().includes(texto);
        if (!coincideTexto) return false;

        if (filtroEquipo.value !== "todos" && a.equipo !== filtroEquipo.value)
            return false;

        if (filtroEstado.value !== "todos") {
            const estado = calcularEstado(a);
            if (estado !== filtroEstado.value) return false;
        }

        return true;
    });

    // ORDEN POR PRIORIDAD
    filtrados.sort((a, b) => ordenEstado(a) - ordenEstado(b));

    return filtrados;
}

// ==================================
//      RENDER TABLA + PAGINACIÓN
// ==================================
function renderTabla() {
    const filtrados = obtenerFiltrados();

    const totalPaginas = Math.ceil(filtrados.length / porPagina);
    if (paginaActual > totalPaginas) paginaActual = totalPaginas || 1;

    const inicio = (paginaActual - 1) * porPagina;
    const paginados = filtrados.slice(inicio, inicio + porPagina);

    tbody.innerHTML = "";

    paginados.forEach(a => {
        const estado = calcularEstado(a);

        const tr = document.createElement("tr");
        tr.classList.add(`fila-${estado}`);

        tr.innerHTML = `
            <td>${a.nombre} ${a.apellido}</td>
            <td>${a.dni}</td>
            <td>${a.telefono}</td>
            <td>${a.nivel}</td>

            <td>
                <select class="select-equipo" onchange="cambiarEquipo(${a.id}, this.value)">
                    <option value="morado" ${a.equipo === "morado" ? "selected" : ""}>Morado</option>
                    <option value="blanco" ${a.equipo === "blanco" ? "selected" : ""}>Blanco</option>
                </select>
            </td>

            <td>${a.fecha_vencimiento ? new Date(a.fecha_vencimiento).toLocaleDateString() : "-"}</td>
            <td>${estado.replace("-", " ")}</td>

            <td>
                <button class="btn-edit" onclick="toggleEstado(${a.id}, ${a.activo})">
                    ${a.activo ? "Desactivar" : "Activar"}
                </button>

                <button class="btn-delete" onclick="borrarAlumno(${a.id})">Borrar</button>

                <button class="btn-ws" onclick="enviarWhatsApp('${a.telefono}')">WS</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    renderPaginacion(totalPaginas);
}

// ==================================
//      PAGINACIÓN
// ==================================
function renderPaginacion(total) {
    paginacion.innerHTML = "";

    if (total <= 1) return;

    // Botón anterior <
    const prev = document.createElement("button");
    prev.textContent = "<";
    prev.disabled = paginaActual === 1;
    prev.onclick = () => {
        paginaActual--;
        renderTabla();
    };
    paginacion.appendChild(prev);

    // Números
    for (let i = 1; i <= total; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === paginaActual) btn.classList.add("active");
        btn.onclick = () => {
            paginaActual = i;
            renderTabla();
        };
        paginacion.appendChild(btn);
    }

    // Botón siguiente >
    const next = document.createElement("button");
    next.textContent = ">";
    next.disabled = paginaActual === total;
    next.onclick = () => {
        paginaActual++;
        renderTabla();
    };
    paginacion.appendChild(next);
}

// ==================================
//      ESTADO
// ==================================
function calcularEstado(a) {
    if (!a.activo) return "inactivo";

    const hoy = new Date();
    const vence = new Date(a.fecha_vencimiento);

    if (vence < hoy) return "vencido";

    const diff = (vence - hoy) / (1000 * 60 * 60 * 24);
    if (diff <= 7) return "por-vencer";

    return "al-dia";
}

function ordenEstado(a) {
    const estado = calcularEstado(a);
    return { "vencido": 1, "por-vencer": 2, "al-dia": 3, "inactivo": 4 }[estado];
}

// ==================================
//      CAMBIAR EQUIPO
// ==================================
async function cambiarEquipo(id, equipo) {
    await fetch(`${API}/${id}/equipo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipo })
    });
    cargarAlumnos();
}

// ==================================
//      ACTIVAR / DESACTIVAR
// ==================================
async function toggleEstado(id, activoActual) {
    const ruta = activoActual ? `${API}/${id}/desactivar` : `${API}/${id}/activar`;
    await fetch(ruta, { method: "PUT" });
    cargarAlumnos();
}

// ==================================
//      BORRAR
// ==================================
async function borrarAlumno(id) {
    if (!confirm("¿Seguro que querés borrar este alumno?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    cargarAlumnos();
}

// ==================================
//      WHATSAPP
// ==================================
function enviarWhatsApp(numero) {
    window.open(`https://wa.me/${numero}`, "_blank");
}

// ==================================
//      EVENTOS
// ==================================
buscador.addEventListener("input", () => { paginaActual = 1; renderTabla(); });
filtroEquipo.addEventListener("change", () => { paginaActual = 1; renderTabla(); });
filtroEstado.addEventListener("change", () => { paginaActual = 1; renderTabla(); });
