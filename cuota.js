// ==============================
// CONFIG
// ==============================
const API_URL = "https://gimnasio-online-1.onrender.com";

// ==============================
// EVENTO PRINCIPAL
// ==============================
document.addEventListener("DOMContentLoaded", cargarAdministracion);

let alumnosGlobal = []; // Para filtros y buscador

// ==============================
// FORMATEAR FECHA dd/mm/aaaa
// ==============================
function formatearFecha(iso) {
    if (!iso) return "Sin datos";
    const f = new Date(iso);
    if (isNaN(f.getTime())) return "Sin datos";
    const d = String(f.getDate()).padStart(2, "0");
    const m = String(f.getMonth() + 1).padStart(2, "0");
    const y = f.getFullYear();
    return `${d}/${m}/${y}`;
}

// ==============================
// CREAR BÚSQUEDA + FILTROS
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
  document
    .getElementById("filtroEstado")
    .addEventListener("change", aplicarFiltros);
}

// ==============================
// CARGAR ADMINISTRACIÓN
// ==============================
async function cargarAdministracion() {
  crearControles();

  const cont = document.getElementById("listaAdmin");
  cont.innerHTML = "Cargando alumnos...";

  try {
    // 1) TRAER ALUMNOS
    const resAlumnos = await fetch(`${API_URL}/alumnos`);
    const alumnos = await resAlumnos.json();

    // 2) POR CADA ALUMNO → ÚLTIMA CUOTA
    for (let al of alumnos) {
      const resHist = await fetch(`${API_URL}/cuotas/historial/${al.id}`);
      const hist = await resHist.json();

      const ultima = hist[0]; // la más reciente (ordenada DESC en backend)
      al.vencimiento = ultima
        ? formatearFecha(ultima.fecha_vencimiento)
        : "Sin datos";

      // ==============================
      // CALCULAR ESTADO SEGÚN VTO
      // ==============================
      let estado = "";
      let estadoClave = "";
      let claseFila = "";
      let mensajeWs = "";

      if (!ultima) {
        estado = "Sin cuota";
        estadoClave = "sin_cuota";
        claseFila = "fila-sin-cuota";
        mensajeWs = `Hola ${al.nombre}, todavía no registramos una cuota activa.`;
      } else {
        const hoy = new Date();
        const vto = new Date(ultima.fecha_vencimiento);
        const diff = Math.ceil((vto - hoy) / (1000 * 60 * 60 * 24));

        if (vto < hoy) {
          // 🔴 VENCIDO
          estado = "Vencido";
          estadoClave = "vencido";
          claseFila = "fila-vencido";
          mensajeWs = `Hola ${al.nombre}, tu cuota se venció el ${al.vencimiento}.`;
        } else if (diff <= 5) {
          // 🟡 POR VENCER
          estado = "Por vencer";
          estadoClave = "por_vencer";
          claseFila = "fila-por-vencer";
          mensajeWs = `Hola ${al.nombre}, tu cuota vence el ${al.vencimiento}.`;
        } else {
          // 🟢 AL DÍA
          estado = "Al día";
          estadoClave = "al_dia";
          claseFila = "fila-al-dia";
          mensajeWs = `Hola ${al.nombre}, tu cuota está al día.`;
        }
      }

      // Si está inactivo → fila gris
      if (!al.activo) {
        estadoClave = "inactivo";
        claseFila = "fila-inactivo";
      }

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
    console.error("Error en cargarAdministracion:", e);
  }
}

// ==============================
// ORDENAR (activos primero + prioridad de estado)
// ==============================
function ordenarLista() {
  alumnosGlobal.sort((a, b) => {
    if (a.activo !== b.activo) return b.activo - a.activo;

    const orden = {
      vencido: 1,
      por_vencer: 2,
      al_dia: 3,
      sin_cuota: 4,
      inactivo: 5,
    };

    return (orden[a.estadoClave] || 99) - (orden[b.estadoClave] || 99);
  });
}

// ==============================
// FILTRAR (texto + estado)
// ==============================
function aplicarFiltros() {
  const texto = document.getElementById("buscar").value.toLowerCase();
  const filtro = document.getElementById("filtroEstado").value;

  const lista = alumnosGlobal.filter((a) => {
    const coincideTexto =
      (a.nombre || "").toLowerCase().includes(texto) ||
      (a.apellido || "").toLowerCase().includes(texto) ||
      String(a.dni || "").includes(texto);

    let coincideEstado = false;

    switch (filtro) {
      case "todos":
        coincideEstado = true;
        break;
      case "activos":
        coincideEstado = Number(a.activo) === 1;
        break;
      case "inactivos":
        coincideEstado = Number(a.activo) === 0;
        break;
      case "vencidos":
        coincideEstado = a.estadoClave === "vencido";
        break;
      case "por_vencer":
        coincideEstado = a.estadoClave === "por_vencer";
        break;
      case "al_dia":
        coincideEstado = a.estadoClave === "al_dia";
        break;
    }

    return coincideTexto && coincideEstado;
  });

  renderTabla(lista);
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
                <select onchange="cambiarEquipo(${al.id}, this.value)">
                    <option value="">-</option>
                    <option value="blanco" ${
                      al.equipo === "blanco" ? "selected" : ""
                    }>Blanco</option>
                    <option value="morado" ${
                      al.equipo === "morado" ? "selected" : ""
                    }>Morado</option>
                </select>
            </td>

            <td>
                <button class="btn-ws"
                    onclick="enviarWhatsapp('${al.telefono}', '${encodeURIComponent(
      al.mensajeWs
    )}')">
                    WhatsApp
                </button>
            </td>

            <td>
                <button class="btn-edit" 
                    onclick="toggleActivo(${al.id}, ${al.activo})">
                    ${al.activo ? "Desactivar" : "Activar"}
                </button>

                <button class="btn-delete" onclick="eliminarAlumno(${al.id})">
                    Borrar
                </button>
            </td>
        </tr>`;
  }

  html += "</tbody></table>";
  cont.innerHTML = html;
}

// ==============================
// WHATSAPP
// ==============================
function enviarWhatsapp(numero, msg) {
  if (!numero) {
    alert("El alumno no tiene número de teléfono.");
    return;
  }
  const url = `https://wa.me/549${numero}?text=${msg}`;
  window.open(url, "_blank");
}

// ==============================
// CAMBIAR ACTIVO
// ==============================
async function toggleActivo(id, activo) {
  const ruta = activo
    ? `${API_URL}/alumnos/${id}/desactivar`
    : `${API_URL}/alumnos/${id}/activar`;

  await fetch(ruta, { method: "PUT" });
  await cargarAdministracion();
}

// ==============================
// CAMBIAR EQUIPO
// ==============================
async function cambiarEquipo(id, equipo) {
  if (!equipo) return;

  await fetch(`${API_URL}/alumnos/${id}/equipo`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ equipo }),
  });

  await cargarAdministracion();
}

// ==============================
// ELIMINAR ALUMNO
// ==============================
async function eliminarAlumno(id) {
  const ok = confirm(
    "⚠️ ¿Eliminar alumno permanentemente? Esta acción NO se puede deshacer."
  );
  if (!ok) return;

  const res = await fetch(`${API_URL}/alumnos/${id}`, { method: "DELETE" });

  if (!res.ok) {
    alert("Error al eliminar alumno");
    return;
  }

  await cargarAdministracion();
}

// Exponer funciones al scope global (para los onclick del HTML generado)
window.cambiarEquipo = cambiarEquipo;
window.toggleActivo = toggleActivo;
window.eliminarAlumno = eliminarAlumno;
window.enviarWhatsapp = enviarWhatsapp;
