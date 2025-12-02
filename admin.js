const API = "https://gimnasio-online-1.onrender.com/admin";

const tbody = document.getElementById("tbodyAdmin");
const buscador = document.getElementById("buscador");
const filtroEquipo = document.getElementById("filtroEquipo");
const filtroEstado = document.getElementById("filtroEstado");

let alumnos = [];

// ================================
//      CARGAR ALUMNOS
// ================================
async function cargarAlumnos() {
    const res = await fetch(API);
    alumnos = await res.json();
    renderTabla();
}

cargarAlumnos();

// ================================
//      RENDER TABLA COMPLETA
// ================================
function renderTabla() {
    tbody.innerHTML = "";

    const hoy = new Date();

    let filtrados = alumnos.filter(a => {
        const texto = buscador.value.toLowerCase();
        const coincideTexto =
            (a.nombre + " " + a.apellido + " " + a.dni).toLowerCase().includes(texto);

        if (!coincideTexto) return false;

        if (filtroEquipo.value !== "todos") {
            if (a.equipo !== filtroEquipo.value) return false;
        }

        if (filtroEstado.value !== "todos") {
            const estado = calcularEstado(a);
            if (estado !== filtroEstado.value) return false;
        }

        return true;
    });

    // ORDENAR POR ESTADO (vencido → por vencer → al día → inactivo)
    filtrados.sort((a, b) => ordenEstado(a) - ordenEstado(b));

    filtrados.forEach(a => {
        const tr = document.createElement("tr");
        const estado = calcularEstado(a);

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

                <button class="btn-delete" onclick="borrarAlumno(${a.id})">
                    Borrar
                </button>

                <button class="btn-ws" onclick="enviarWhatsApp('${a.telefono}')">
                    WS
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ================================
//      CALCULAR ESTADO
// ================================
function calcularEstado(a) {
    if (!a.activo) return "inactivo";

    const hoy = new Date();
    const vence = new Date(a.fecha_vencimiento);

    if (vence < hoy) return "vencido";

    const diff = (vence - hoy) / (1000 * 60 * 60 * 24);

    if (diff <= 7) return "por-vencer";

    return "al-dia";
}

// PRIORIDAD DE ORDENAMIENTO
function ordenEstado(a) {
    const estado = calcularEstado(a);
    if (estado === "vencido") return 1;
    if (estado === "por-vencer") return 2;
    if (estado === "al-dia") return 3;
    return 4; // inactivo
}

// ================================
//      CAMBIAR EQUIPO
// ================================
async function cambiarEquipo(id, equipo) {
    await fetch(`${API}/${id}/equipo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipo })
    });
    cargarAlumnos();
}

// ================================
//      ACTIVAR / DESACTIVAR
// ================================
async function toggleEstado(id, activoActual) {
    const ruta = activoActual
        ? `${API}/${id}/desactivar`
        : `${API}/${id}/activar`;

    await fetch(ruta, { method: "PUT" });
    cargarAlumnos();
}

// ================================
//      BORRAR ALUMNO
// ================================
async function borrarAlumno(id) {
    if (!confirm("¿Seguro que querés borrar este alumno?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });
    cargarAlumnos();
}

// ================================
//      WHATSAPP
// ================================
function enviarWhatsApp(numero) {
    window.open(`https://wa.me/${numero}`, "_blank");
}

// ================================
//      EVENTOS DE FILTRO
// ================================
buscador.addEventListener("input", renderTabla);
filtroEquipo.addEventListener("change", renderTabla);
filtroEstado.addEventListener("change", renderTabla);
