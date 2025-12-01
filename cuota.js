document.addEventListener("DOMContentLoaded", cargarAdministracion);

let alumnosGlobal = []; // Para búsquedas y filtros

// ==============================
// 📌 Formatea fecha ISO → dd/mm/aaaa
// ==============================
function formatearFecha(iso) {
    const f = new Date(iso);
    const d = String(f.getDate()).padStart(2, "0");
    const m = String(f.getMonth() + 1).padStart(2, "0");
    const y = f.getFullYear();
    return `${d}/${m}/${y}`;
}

// ==============================
// 📌 Construye buscador + filtros
// ==============================
function crearControles() {
    const cont = document.getElementById("admin-controles");

    cont.innerHTML = `
        <div class="panel-controles">
            <input 
                type="text" 
                id="buscar"
                class="input-search"
                placeholder="Buscar por nombre o DNI">

            <select id="filtroEstado" class="input-filter">
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
                <option value="vencidos">Vencidos</option>
                <option value="por_vencer">Por vencer</option>
                <option value="al_dia">Al día</option>
            </select>
        </div>
    `;

    document.getElementById("buscar").addEventListener("input", aplicarFiltros);
    document.getElementById("filtroEstado").addEventListener("change", aplicarFiltros);
}

// ==============================
// 📌 Filtrar por texto y estado
// ==============================
function aplicarFiltros() {
    let texto = document.getElementById("buscar").value.toLowerCase();
    let filtro = document.getElementById("filtroEstado").value;

    let lista = alumnosGlobal;

    lista = lista.filter(a => {
        let coincideTexto =
            a.nombre.toLowerCase().includes(texto) ||
            a.apellido.toLowerCase().includes(texto) ||
            String(a.dni).includes(texto);

        let coincideEstado = false;

        switch (filtro) {
            case "todos": coincideEstado = true; break;
            case "activos": coincideEstado = Number(a.activo) === 1; break;
            case "inactivos": coincideEstado = Number(a.activo) === 0; break;

            case "vencidos": coincideEstado = a.estadoClave === "vencido"; break;
            case "por_vencer": coincideEstado = a.estadoClave === "por_vencer"; break;
            case "al_dia": coincideEstado = a.estadoClave === "al_dia"; break;
        }

        return coincideTexto && coincideEstado;
    });

    renderTabla(lista);
}

// ==============================
// 📌 Cargar administración
// ==============================
async function cargarAdministracion() {
    crearControles();

    const cont = document.getElementById("listaAdmin");
    cont.innerHTML = "Cargando alumnos...";

    try {
        const resAlumnos = await fetch("https://gimnasio-backend-u3xo.onrender.com/alumnos");
        const alumnos = await resAlumnos.json();

        for (let al of alumnos) {
            const resHist = await fetch(`https://gimnasio-backend-u3xo.onrender.com/cuotas/historial/${al.id_alumno}`);
            const hist = await resHist.json();
            const ultima = hist[0];

            al.vencimiento = ultima ? formatearFecha(ultima.fecha_vencimiento) : "Sin datos";

            let estado = "";
            let estadoClave = "";
            let claseFila = "";
            let mensajeWs = "";

            // ==========================
            // 🟥 SIN CUOTA
            // ==========================
            if (!ultima) {
                estado = "Sin cuota";
                estadoClave = "sin_cuota";
                claseFila = "fila-sin-cuota";
                mensajeWs = `Hola ${al.nombre}, todavía no tenemos registrada una cuota activa.`;
            }

            else {
                const hoy = new Date();
                const vto = new Date(ultima.fecha_vencimiento);
                const diff = Math.ceil((vto - hoy) / (1000 * 60 * 60 * 24));


                // ==========================
                // 🟥 CUOTA VENCIDA
                // ==========================
                if (vto < hoy) {
                    estado = "Vencido";
                    estadoClave = "vencido";
                    claseFila = "fila-vencido";
                    mensajeWs = `Hola ${al.nombre}, tu cuota se venció el ${al.vencimiento}.`;
                }

                // ==========================
                // 🟨 POR VENCER (5 días o menos)
                // ==========================
                else if (diff <= 5) {
                    estado = "Por vencer";
                    estadoClave = "por_vencer";
                    claseFila = "fila-por-vencer"; // ⭐ CORREGIDO
                    mensajeWs = `Hola ${al.nombre}, tu cuota vence el ${al.vencimiento}.`;
                }

                // ==========================
                // 🟩 AL DÍA
                // ==========================
                else {
                    estado = "Al día";
                    estadoClave = "al_dia";
                    claseFila = "fila-al-dia";
                    mensajeWs = `Hola ${al.nombre}, tu cuota está al día.`;
                }
            }

            // ==========================
            // ⚫ SI ESTÁ INACTIVO (gris)
            // ==========================
            if (!al.activo) {
                estadoClave = "inactivo";
                claseFila = "fila-inactivo";
            }

            // Guardar datos finales
            al.estado = estado;
            al.estadoClave = estadoClave;
            al.claseFila = claseFila;
            al.mensajeWs = mensajeWs;
        }

        alumnosGlobal = alumnos;

        ordenarLista();
        aplicarFiltros();

    } catch (e) {
        cont.innerHTML = "Error al cargar la información.";
    }
}

// ==============================
// 📌 Ordenar por prioridad visual
// ==============================
function ordenarLista() {
    alumnosGlobal.sort((a, b) => {
        if (a.activo !== b.activo) return b.activo - a.activo;

        const orden = {
            vencido: 1,
            por_vencer: 2,
            al_dia: 3,
            sin_cuota: 4,
            inactivo: 5
        };

        return orden[a.estadoClave] - orden[b.estadoClave];
    });
}

// ==============================
// 📌 Render tabla
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
                <th>WhatsApp</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>
    `;

    for (let al of lista) {
        html += `
        <tr class="${al.claseFila}">
            <td>${al.nombre} ${al.apellido} ${al.activo ? "" : "(inactivo)"}</td>
            <td>${al.vencimiento}</td>
            <td><b>${al.estado}</b></td>

            <td>
                <select onchange="cambiarEquipo(${al.id_alumno}, this.value)">
                    <option value="">-</option>
                    <option value="blanco" ${al.equipo === "blanco" ? "selected" : ""}>Blanco</option>
                    <option value="morado" ${al.equipo === "morado" ? "selected" : ""}>Morado</option>
                </select>
            </td>
            <td>

                <button class="btn-ws"
                    onclick="enviarWhatsapp('${al.telefono}', '${encodeURIComponent(al.mensajeWs)}')">
                    WhatsApp
                </button>
            </td>


            <td>

                <button class="btn-edit" 
                    onclick="toggleActivo(${al.id_alumno}, ${al.activo})">
                    ${al.activo ? "Desactivar" : "Activar"}
                </button>

                <button class="btn-delete" onclick="eliminarAlumno(${al.id_alumno})">
                    Borrar
                </button>

            </td>

        </tr>`;
    }

    html += "</tbody></table>";
    cont.innerHTML = html;
}

// ==============================
// 📌 WhatsApp
// ==============================
function enviarWhatsapp(numero, msg) {
    if (!numero) {
        alert("El alumno no tiene número de teléfono registrado.");
        return;
    }

    // Si los números están guardados como 3875123456, se usa con prefijo 549
    const url = `https://wa.me/549${numero}?text=${msg}`;

    window.open(url, "_blank");
}


// ==============================
// 📌 Activar / Desactivar alumno
// ==============================
async function toggleActivo(id, activo) {
    const ruta = activo
        ? `https://gimnasio-backend-u3xo.onrender.com/alumnos/${id}/desactivar`
        : `https://gimnasio-backend-u3xo.onrender.com/alumnos/${id}/activar`;


    await fetch(ruta, { method: "PUT" });
    await cargarAdministracion();
}

// ==============================
// 📌 Cambiar equipo
// ==============================
async function cambiarEquipo(id, equipo) {
    if (!equipo) return;

    await fetch(`https://gimnasio-backend-u3xo.onrender.com/alumnos/${id}/equipo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipo })
    });


    await cargarAdministracion();
}

async function eliminarAlumno(id) {
    const ok = confirm("⚠️ ¿Eliminar alumno permanentemente? Esta acción NO se puede deshacer.");

    if (!ok) return;

    const res = await fetch(`https://gimnasio-backend-u3xo.onrender.com/alumnos/${id}`, {
        method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Error al borrar alumno");
        return;
    }

    alert("Alumno eliminado correctamente.");

    // refresca TODO
    cargarAdministracion();
}

