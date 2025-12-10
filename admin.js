const API = "https://gimnasio-online-1.onrender.com/admin";

const tbody = document.getElementById("tbodyAdmin");
const buscador = document.getElementById("buscador");
const filtroEquipo = document.getElementById("filtroEquipo");
const filtroEstado = document.getElementById("filtroEstado");
const paginacion = document.getElementById("paginacion");
const filtroPlan = document.getElementById("filtroPlan");


let alumnos = [];
let paginaActual = 1;
const porPagina = 10;

// ==================================
//   FUNCIONES DE FECHA SIN ERROR UTC
// ==================================
function normalizarFechaTexto(fechaCruda) {
    if (!fechaCruda) return null;
    return fechaCruda.split("T")[0];
}

function fechaToDMY(fechaCruda) {
    const soloFecha = normalizarFechaTexto(fechaCruda);
    if (!soloFecha) return "-";
    const [y, m, d] = soloFecha.split("-");
    return `${d}/${m}/${y}`;
}

function fechaLocal(soloFecha) {
    if (!soloFecha) return null;
    const [y, m, d] = soloFecha.split("-").map(Number);
    return new Date(y, m - 1, d);
}

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
//      FILTROS + ORDENAMIENTO
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
        // 🔥 FILTRO POR PLAN
        if (filtroPlan.value !== "todos") {
            if (filtroPlan.value === "eg" && !a.plan_eg) return false;
            if (filtroPlan.value === "personalizado" && !a.plan_personalizado) return false;
            if (filtroPlan.value === "running" && !a.plan_running) return false;
        }


        return true;
    });

    // ORDEN: estado → apellido → nombre
    filtrados.sort((a, b) => {
        const diffEstado = ordenEstado(a) - ordenEstado(b);
        if (diffEstado !== 0) return diffEstado;

        const apA = a.apellido.toLowerCase();
        const apB = b.apellido.toLowerCase();
        if (apA !== apB) return apA.localeCompare(apB);

        return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
    });

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
        const fechaMostrar = fechaToDMY(a.fecha_vencimiento);

        const tr = document.createElement("tr");
        tr.classList.add(`fila-${estado}`);

        tr.innerHTML = `
            <td>${a.apellido} ${a.nombre}</td>
            <td>${a.dni}</td>
            <td>${a.telefono}</td>
            <td>${a.nivel}</td>

            <td>
                <select class="select-equipo" onchange="cambiarEquipo(${a.id}, this.value)">
                    <option value="morado" ${a.equipo === "morado" ? "selected" : ""}>Morado</option>
                    <option value="blanco" ${a.equipo === "blanco" ? "selected" : ""}>Blanco</option>
                </select>
            </td>

            <td>${fechaMostrar}</td>
            <td>${estado.replace("-", " ")}</td>

            <td>
                <button class="btn-edit" onclick="toggleEstado(${a.id}, ${a.activo})">
                    ${a.activo ? "Desactivar" : "Activar"}
                </button>

                <button class="btn-delete" onclick="borrarAlumno(${a.id})">Borrar</button>

                <button class="btn-ws" onclick='enviarWhatsApp("${a.telefono}", ${JSON.stringify(a)})'>WS</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    actualizarContadores();
    renderPaginacion(totalPaginas);
}

// ==================================
//      CONTADORES
// ==================================
function actualizarContadores() {
    const total = alumnos.length;

    let alDia = 0, porVencer = 0, vencidos = 0, inactivos = 0;
    let morados = 0, blancos = 0;

    alumnos.forEach(a => {
        const estado = calcularEstado(a);

        if (estado === "al-dia") alDia++;
        else if (estado === "por-vencer") porVencer++;
        else if (estado === "vencido") vencidos++;
        else if (estado === "inactivo") inactivos++;

        if (a.equipo === "morado") morados++;
        if (a.equipo === "blanco") blancos++;
    });

    document.getElementById("contTotal").textContent = total;
    document.getElementById("contAlDia").textContent = alDia;
    document.getElementById("contPorVencer").textContent = porVencer;
    document.getElementById("contVencidos").textContent = vencidos;
    document.getElementById("contInactivos").textContent = inactivos;

    document.getElementById("contMorados").textContent = morados;
    document.getElementById("contBlancos").textContent = blancos;
}

// ==================================
//      PAGINACIÓN
// ==================================
function renderPaginacion(total) {
    paginacion.innerHTML = "";
    if (total <= 1) return;

    // Botón anterior
    const prev = document.createElement("button");
    prev.textContent = "<";
    prev.disabled = paginaActual === 1;
    prev.onclick = () => { paginaActual--; renderTabla(); };
    paginacion.appendChild(prev);

    // Mostrar solo las primeras 10 páginas
    const maxPaginas = 10;
    const limite = Math.min(total, maxPaginas);

    for (let i = 1; i <= limite; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === paginaActual) btn.classList.add("active");
        btn.onclick = () => { paginaActual = i; renderTabla(); };
        paginacion.appendChild(btn);
    }

    // Si hay más páginas, mostrar "..."
    if (total > maxPaginas) {
        const puntos = document.createElement("button");
        puntos.textContent = "...";
        puntos.disabled = true;
        paginacion.appendChild(puntos);
    }

    // Botón siguiente
    const next = document.createElement("button");
    next.textContent = ">";
    next.disabled = paginaActual === total;
    next.onclick = () => { paginaActual++; renderTabla(); };
    paginacion.appendChild(next);
}


// ==================================
//      ESTADO
// ==================================
function calcularEstado(a) {
    if (!a.activo) return "inactivo";

    const hoy = new Date();
    const fechaTexto = normalizarFechaTexto(a.fecha_vencimiento);
    const vence = fechaLocal(fechaTexto);

    if (!vence) return "inactivo";
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
//      WHATSAPP AUTOMÁTICO
// ==================================
function enviarWhatsApp(numero, alumno) {
    const estado = calcularEstado(alumno);
    const fecha = fechaToDMY(alumno.fecha_vencimiento);

    let mensaje = "";

    if (estado === "vencido") {
        mensaje = `Hola! Somos de EG GYM.\nQueríamos recordarte que tu cuota se venció el ${fecha}.`;
    } 
    else if (estado === "por-vencer") {
        mensaje = `Hola! Somos de EG GYM.\nQueríamos avisarte que tu cuota se vence el ${fecha}.`;
    }
    else {
        mensaje = "Hola! ¿Cómo estás? Te contactamos de EGYM.";
    }

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
}

// ==================================
//      EVENTOS
// ==================================
buscador.addEventListener("input", () => { paginaActual = 1; renderTabla(); });
filtroEquipo.addEventListener("change", () => { paginaActual = 1; renderTabla(); });
filtroEstado.addEventListener("change", () => { paginaActual = 1; renderTabla(); });
filtroPlan.addEventListener("change", () => {
    paginaActual = 1;
    renderTabla();
});

