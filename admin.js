console.log("ADMIN JS VERSION FINAL 2025");

const API_URL = "https://gimnasio-online-1.onrender.com";

document.addEventListener("DOMContentLoaded", cargarAdmin);
let alumnos = [];

// ===========================
// CARGAR ALUMNOS
// ===========================
async function cargarAdmin() {
    const cont = document.getElementById("listaAdmin");
    cont.innerHTML = "Cargando...";

    try {
        const res = await fetch(`${API_URL}/admin`);
        alumnos = await res.json();

        alumnos.forEach(a => {
            if (!a.equipo) a.equipo = "morado"; // evitar null
        });

        procesarEstados();
        ordenarLista();
        crearControles();
        filtrar();

    } catch (err) {
        console.error("ERROR AL CARGAR ADMIN:", err);
        cont.innerHTML = "Error cargando datos";
    }
}

// ===========================
// FORMATEO FECHA
// ===========================
function formatearFecha(f) {
    if (!f) return "—";
    return new Date(f).toLocaleDateString("es-AR");
}

// ===========================
// ESTADOS
// ===========================
function procesarEstados() {
    const hoy = new Date();

    alumnos.forEach(a => {
        if (!a.fecha_vencimiento) {
            a.estado = "Sin cuota";
            a.estadoClave = "sin_cuota";
            a.claseFila = "sin-cuota";
            return;
        }

        const vto = new Date(a.fecha_vencimiento);
        const diff = Math.ceil((vto - hoy) / 86400000);

        if (!a.activo) {
            a.estado = "Inactivo";
            a.estadoClave = "inactivo";
            a.claseFila = "inactivo";
            return;
        }

        if (vto < hoy) {
            a.estado = "Vencido";
            a.estadoClave = "vencido";
            a.claseFila = "vencido";
            return;
        }

        if (diff <= 5) {
            a.estado = "Por vencer";
            a.estadoClave = "por_vencer";
            a.claseFila = "por-vencer";
            return;
        }

        a.estado = "Al día";
        a.estadoClave = "al_dia";
        a.claseFila = "al-dia";
    });
}

// ===========================
// ORDEN
// ===========================
function ordenarLista() {
    const prioridad = {
        vencido: 1,
        por_vencer: 2,
        al_dia: 3,
        sin_cuota: 4,
        inactivo: 5
    };

    alumnos.sort((a, b) => {
        if (a.activo !== b.activo) return Number(b.activo) - Number(a.activo);
        return (prioridad[a.estadoClave] || 99) - (prioridad[b.estadoClave] || 99);
    });
}

// ===========================
// CONTROLES
// ===========================
function crearControles() {
    const cont = document.getElementById("admin-controles");

    cont.innerHTML = `
    <div class="admin-filtros">

        <input id="buscar" class="input-search" placeholder="Buscar...">

        <select id="filtroEstado" class="input-filter">
            <option value="todos">Estado: Todos</option>
            <option value="vencido">Vencidos</option>
            <option value="por_vencer">Por vencer</option>
            <option value="al_dia">Al día</option>
            <option value="sin_cuota">Sin cuota</option>
            <option value="inactivo">Inactivos</option>
        </select>

        <select id="filtroActivo" class="input-filter">
            <option value="todos">Activos + inactivos</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
        </select>

        <select id="filtroEquipo" class="input-filter">
            <option value="todos">Todos</option>
            <option value="morado">Morado</option>
            <option value="blanco">Blanco</option>
        </select>

    </div>
    `;

    document.getElementById("buscar").oninput = filtrar;
    document.getElementById("filtroEstado").onchange = filtrar;
    document.getElementById("filtroActivo").onchange = filtrar;
    document.getElementById("filtroEquipo").onchange = filtrar;
}

// ===========================
// FILTRAR
// ===========================
function filtrar() {
    const t = document.getElementById("buscar").value.toLowerCase();
    const est = document.getElementById("filtroEstado").value;
    const act = document.getElementById("filtroActivo").value;
    const eq = document.getElementById("filtroEquipo").value;

    const lista = alumnos.filter(a => {
        const coincideTexto =
            a.nombre.toLowerCase().includes(t) ||
            a.apellido.toLowerCase().includes(t) ||
            String(a.dni).includes(t);

        const coincideEstado = est === "todos" || a.estadoClave === est;

        const coincideActivo =
            act === "todos" ||
            (act === "activos" && a.activo) ||
            (act === "inactivos" && !a.activo);

        const coincideEquipo =
            eq === "todos" || a.equipo === eq;

        return coincideTexto && coincideEstado && coincideActivo && coincideEquipo;
    });

    renderTabla(lista);
}

// ===========================
// TABLA
// ===========================
function renderTabla(lista) {
    const cont = document.getElementById("listaAdmin");

    let html = `
    <table class="tabla-alumnos">
        <thead>
            <tr>
                <th>Alumno</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Equipo</th>
                <th>WS</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>
    `;

    lista.forEach(a => {
        html += `
        <tr class="${a.claseFila}">
            <td>${a.nombre} ${a.apellido} ${a.activo ? "" : "(inactivo)"}</td>
            <td>${formatearFecha(a.fecha_vencimiento)}</td>
            <td><b>${a.estado}</b></td>

            <td>
                <select onchange="cambiarEquipo(${a.id}, this.value)">
                    <option value="morado" ${a.equipo === "morado" ? "selected" : ""}>Morado</option>
                    <option value="blanco" ${a.equipo === "blanco" ? "selected" : ""}>Blanco</option>
                </select>
            </td>

            <td>
                <button class="btn-ws"
                 ${!a.telefono || a.estadoClave === "inactivo" ? "disabled" : ""}
                 onclick="enviarWs('${a.telefono}', 'Hola ${a.nombre}, tu cuota...')">
                 WS
                </button>
            </td>

            <td>
                <button onclick="toggleActivo(${a.id}, ${a.activo})">
                    ${a.activo ? "Desactivar" : "Activar"}
                </button>

                <button onclick="eliminarAlumno(${a.id})" class="btn-delete">X</button>
            </td>
        </tr>`;
    });

    html += "</tbody></table>";

    cont.innerHTML = html;
}

// ===========================
// ACCIONES
// ===========================

async function cambiarEquipo(id, equipo) {
    await fetch(`${API_URL}/admin/equipo/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({equipo})
    });

    cargarAdmin();
}

async function toggleActivo(id, activoActual) {
    const ruta = activoActual
        ? `${API_URL}/admin/desactivar/${id}`
        : `${API_URL}/admin/activar/${id}`;

    await fetch(ruta, { method: "PUT" });
    cargarAdmin();
}

async function eliminarAlumno(id) {
    if (!confirm("¿Eliminar alumno definitivamente?")) return;

    await fetch(`${API_URL}/admin/${id}`, { method: "DELETE" });
    cargarAdmin();
}

function enviarWs(tel, msg) {
    const limpio = tel.replace(/\D/g, "");
    window.open(`https://wa.me/549${limpio}?text=${encodeURIComponent(msg)}`);
}
