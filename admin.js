// ==============================
// CONFIG
// ==============================
const API_URL = "https://gimnasio-online-1.onrender.com";
console.log("ADMIN JS VERSION NUEVA 2025");


document.addEventListener("DOMContentLoaded", cargarCuotas);

let alumnos = [];

// ==============================
// Helpers
// ==============================
function formatearFecha(iso) {
    if (!iso) return "—";
    const f = new Date(iso);
    if (isNaN(f.getTime())) return "—";
    return f.toLocaleDateString("es-AR");
}

// ==============================
// CARGAR TODOS LOS ALUMNOS
// ==============================
async function cargarCuotas() {
    const cont = document.getElementById("listaAdmin");
    cont.innerHTML = "Cargando…";

    crearControles();

    try {
        const res = await fetch(`${API_URL}/alumnos`);
        alumnos = await res.json();

        procesarEstados();
        ordenarLista();
        filtrar();   // aplica filtros actuales y dibuja tabla

    } catch (error) {
        console.error(error);
        cont.innerHTML = "Error cargando datos";
    }
}

// ==============================
// PROCESAR ESTADO SEGÚN FECHA
// ==============================
function procesarEstados() {
    const hoy = new Date();

    alumnos.forEach(al => {
        if (!al.fecha_vencimiento) {
            al.estado = "Sin cuota";
            al.estadoClave = "sin_cuota";
            al.claseFila = "fila-sin-cuota";
            al.mensajeWs = `Hola ${al.nombre}, aún no registramos una cuota activa.`;
            return;
        }

        const vto = new Date(al.fecha_vencimiento);
        const diff = Math.ceil((vto - hoy) / (1000 * 60 * 60 * 24));

        if (!al.activo) {
            al.estado = "Inactivo";
            al.estadoClave = "inactivo";
            al.claseFila = "fila-inactivo";
            al.mensajeWs = "";
            return;
        }

        if (vto < hoy) {
            al.estado = "Vencido";
            al.estadoClave = "vencido";
            al.claseFila = "fila-vencido";
            al.mensajeWs = `Hola ${al.nombre}, tu cuota está vencida desde el ${formatearFecha(al.fecha_vencimiento)}.`;
            return;
        }

        if (diff <= 5) {
            al.estado = "Por vencer";
            al.estadoClave = "por_vencer";
            al.claseFila = "fila-por-vencer";
            al.mensajeWs = `Hola ${al.nombre}, tu cuota vence el ${formatearFecha(al.fecha_vencimiento)}.`;
            return;
        }

        al.estado = "Al día";
        al.estadoClave = "al_dia";
        al.claseFila = "fila-al-dia";
        al.mensajeWs = `Hola ${al.nombre}, tu cuota está al día 😊.`;
    });
}

// ==============================
// ORDEN: activos arriba, inactivos abajo
// luego: vencido → por vencer → al día → sin cuota → inactivo
// ==============================
function ordenarLista() {
    const ordenEstado = {
        vencido: 1,
        por_vencer: 2,
        al_dia: 3,
        sin_cuota: 4,
        inactivo: 5
    };

    alumnos.sort((a, b) => {
        if (Boolean(a.activo) !== Boolean(b.activo)) {
            return (b.activo ? 1 : 0) - (a.activo ? 1 : 0);
        }
        return (ordenEstado[a.estadoClave] || 99) - (ordenEstado[b.estadoClave] || 99);
    });
}

// ==============================
// CONTROLES DE BUSQUEDA Y FILTRO
// ==============================
function crearControles() {
    const cont = document.getElementById("admin-controles");

    cont.innerHTML = `
        <div class="admin-filtros">
            <input id="buscar" class="input-search" placeholder="Buscar nombre o DNI">

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
                <option value="todos">Todos los equipos</option>
                <option value="morado">Sólo morado</option>
                <option value="blanco">Sólo blanco</option>
            </select>
        </div>
    `;

    document.getElementById("buscar").oninput = filtrar;
    document.getElementById("filtroEstado").onchange = filtrar;
    document.getElementById("filtroActivo").onchange = filtrar;
    document.getElementById("filtroEquipo").onchange = filtrar;
}

// ==============================
// FILTRAR RESULTADOS
// ==============================
function filtrar() {
    const texto = document.getElementById("buscar").value.toLowerCase();
    const estadoSel = document.getElementById("filtroEstado").value;
    const activoSel = document.getElementById("filtroActivo").value;
    const equipoSel = document.getElementById("filtroEquipo").value;

    const filtrado = alumnos.filter(a => {
        const coincideTexto =
            (a.nombre || "").toLowerCase().includes(texto) ||
            (a.apellido || "").toLowerCase().includes(texto) ||
            String(a.dni || "").includes(texto);

        const coincideEstado =
            estadoSel === "todos" || a.estadoClave === estadoSel;

        const coincideActivo =
            activoSel === "todos" ||
            (activoSel === "activos" && a.activo) ||
            (activoSel === "inactivos" && !a.activo);

        const coincideEquipo =
            equipoSel === "todos" ||
            a.equipo === equipoSel;
        if (!a.equipo) a.equipo = "morado";



        return coincideTexto && coincideEstado && coincideActivo && coincideEquipo;
    });

    renderTabla(filtrado);
}

// ==============================
// RENDER TABLA
// ==============================
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

    lista.forEach(al => {
        html += `
        <tr class="${al.claseFila}">
            <td>${al.nombre} ${al.apellido} ${!al.activo ? "(inactivo)" : ""}</td>
            <td>${formatearFecha(al.fecha_vencimiento)}</td>
            <td><b>${al.estado}</b></td>

            <td>
                <select onchange="cambiarEquipo(${al.id}, this.value)">
                    <option value="">-</option>
                    <option value="blanco" ${al.equipo === "blanco" ? "selected" : ""}>Blanco</option>
                    <option value="morado" ${al.equipo === "morado" ? "selected" : ""}>Morado</option>
                </select>
            </td>

            <td>
                <button class="btn-ws" 
                    ${!al.telefono || al.estadoClave === "inactivo" ? "disabled" : ""}
                    onclick="enviarWs('${al.telefono}', '${encodeURIComponent(al.mensajeWs)}')">
                    WS
                </button>
            </td>

            <td>
                <button class="btn-edit" onclick="toggleActivo(${al.id}, ${al.activo ? 1 : 0})">
                    ${al.activo ? "Desactivar" : "Activar"}
                </button>

                <button class="btn-delete" onclick="eliminarAlumno(${al.id})">
                    X
                </button>

                ${!al.activo ? `
                    <button class="btn-delete-force" onclick="eliminarForzado(${al.id})">
                        FORZAR
                    </button>
                ` : ""}
            </td>
        </tr>`;
    });

    html += "</tbody></table>";

    cont.innerHTML = html;
}

// ==============================
// FUNCIONES DEL SISTEMA
// ==============================
function enviarWs(tel, msg) {
    window.open(`https://wa.me/549${tel}?text=${msg}`, "_blank");
}

async function cambiarEquipo(id, equipo) {
    if (!equipo) return;

    await fetch(`${API_URL}/admin/equipo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipo })
    });

    cargarCuotas();
}

async function toggleActivo(id, actual) {
    const ruta = actual
        ? `${API_URL}/admin/desactivar/${id}`
        : `${API_URL}/admin/activar/${id}`;

    await fetch(ruta, { method: "PUT" });
    cargarCuotas();
}

async function eliminarAlumno(id) {
    if (!confirm("¿Eliminar alumno definitivamente?")) return;

    await fetch(`${API_URL}/alumnos/${id}`, { method: "DELETE" });
    cargarCuotas();
}

// ==============================
// BORRADO FORZADO
// ==============================
async function eliminarForzado(id) {
    const confirmar = confirm(
        "⚠ ATENCIÓN:\nEsto borrará también TODAS las asistencias del alumno.\n\n¿Seguro que querés continuar?"
    );

    if (!confirmar) return;

    await fetch(`${API_URL}/admin/forzar/${id}`, {
        method: "DELETE"
    });

    cargarCuotas();
}

// ==============================
// REGISTRAR FUNCIONES EN WINDOW
// ==============================
window.cambiarEquipo = cambiarEquipo;
window.toggleActivo = toggleActivo;
window.eliminarAlumno = eliminarAlumno;
window.enviarWs = enviarWs;
window.eliminarForzado = eliminarForzado;
