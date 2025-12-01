
// ==============================
// CONFIG
// ==============================
const API_URL = "https://gimnasio-online-1.onrender.com";

document.addEventListener("DOMContentLoaded", cargarCuotas);

let alumnos = [];

// ==============================
// FORMATEAR FECHA dd/mm/aaaa
// ==============================
function formatearFecha(iso) {
    if (!iso) return "—";
    const f = new Date(iso);
    if (isNaN(f.getTime())) return "—";
    return f.toLocaleDateString("es-AR");
}

// ==============================
// CARGAR ESTADO DE CUOTAS
// ==============================
async function cargarCuotas() {
    const cont = document.getElementById("listaAdmin");
    cont.innerHTML = "Cargando…";

    crearControles();

    try {
        const res = await fetch(`${API_URL}/alumnos`);
        alumnos = await res.json();

        procesarEstados();
        renderTabla(alumnos);

    } catch (error) {
        console.error(error);
        cont.innerHTML = "Error cargando datos";
    }
}

// ==============================
// CALCULAR ESTADO SEGÚN fecha_vencimiento
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

        // INACTIVO  
        if (!al.activo) {
            al.estado = "Inactivo";
            al.estadoClave = "inactivo";
            al.claseFila = "fila-inactivo";
            al.mensajeWs = "";
            return;
        }

        // VENCIDO
        if (vto < hoy) {
            al.estado = "Vencido";
            al.estadoClave = "vencido";
            al.claseFila = "fila-vencido";
            al.mensajeWs = `Hola ${al.nombre}, tu cuota está vencida desde el ${formatearFecha(al.fecha_vencimiento)}.`;
            return;
        }

        // POR VENCER
        if (diff <= 5) {
            al.estado = "Por vencer";
            al.estadoClave = "por_vencer";
            al.claseFila = "fila-por-vencer";
            al.mensajeWs = `Hola ${al.nombre}, tu cuota vence el ${formatearFecha(al.fecha_vencimiento)}.`;
            return;
        }

        // AL DÍA
        al.estado = "Al día";
        al.estadoClave = "al_dia";
        al.claseFila = "fila-al-dia";
        al.mensajeWs = `Hola ${al.nombre}, tu cuota está al día 😊.`;
    });
}

// ==============================
// CONTROLES (BUSCAR Y FILTRAR)
// ==============================
function crearControles() {
    const cont = document.getElementById("admin-controles");

    cont.innerHTML = `
        <input id="buscar" class="input-search" placeholder="Buscar nombre o DNI">

        <select id="filtroEstado" class="input-filter">
            <option value="todos">Todos</option>
            <option value="vencido">Vencidos</option>
            <option value="por_vencer">Por vencer</option>
            <option value="al_dia">Al día</option>
            <option value="inactivo">Inactivos</option>
        </select>
    `;

    document.getElementById("buscar").oninput = filtrar;
    document.getElementById("filtroEstado").onchange = filtrar;
}

function filtrar() {
    const texto = document.getElementById("buscar").value.toLowerCase();
    const estado = document.getElementById("filtroEstado").value;

    const filtrado = alumnos.filter(a => {
        const coincideTexto =
            a.nombre.toLowerCase().includes(texto) ||
            a.apellido.toLowerCase().includes(texto) ||
            String(a.dni || "").includes(texto);

        const coincideEstado =
            estado === "todos" || a.estadoClave === estado;

        return coincideTexto && coincideEstado;
    });

    renderTabla(filtrado);
}

// ==============================
// TABLA
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
                <th>WhatsApp</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>
    `;

    lista.forEach(al => {
        html += `
        <tr class="${al.claseFila}">
            <td>${al.nombre} ${al.apellido}</td>
            <td>${formatearFecha(al.fecha_vencimiento)}</td>
            <td><b>${al.estado}</b></td>

            <td>
                <button class="btn-ws"
                    onclick="enviarWs('${al.telefono}', '${encodeURIComponent(al.mensajeWs)}')">
                    WhatsApp
                </button>
            </td>

            <td>
                <button class="btn-edit" onclick="toggleActivo(${al.id}, ${al.activo})">
                    ${al.activo ? "Desactivar" : "Activar"}
                </button>

                <button class="btn-delete" onclick="eliminarAlumno(${al.id})">
                    Borrar
                </button>
            </td>
        </tr>`;
    });

    html += "</tbody></table>";

    cont.innerHTML = html;
}

// ==============================
// WHATSAPP
// ==============================
function enviarWs(tel, msg) {
    if (!tel) return alert("El alumno no tiene teléfono");
    window.open(`https://wa.me/549${tel}?text=${msg}`, "_blank");
}

// ==============================
// ACTIVAR / DESACTIVAR
// ==============================
async function toggleActivo(id, actual) {
    const ruta = actual
        ? `${API_URL}/alumnos/${id}/desactivar`
        : `${API_URL}/alumnos/${id}/activar`;

    await fetch(ruta, { method: "PUT" });
    cargarCuotas();
}

// ==============================
// ELIMINAR
// ==============================
async function eliminarAlumno(id) {
    if (!confirm("¿Eliminar alumno definitivamente?")) return;
    await fetch(`${API_URL}/alumnos/${id}`, { method: "DELETE" });
    cargarCuotas();
}
