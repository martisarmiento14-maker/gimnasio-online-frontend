// alumnos.js – versión adaptada al backend nuevo (PostgreSQL)

const API_URL = "https://gimnasio-online-1.onrender.com";

// Cuando carga la página, traemos los alumnos
document.addEventListener("DOMContentLoaded", cargarAlumnos);

// ------------------------------
// Helpers
// ------------------------------

// Formatear fecha: dd/mm/aaaa
function formatearFecha(iso) {
    if (!iso) return "-";

    const f = new Date(iso);
    if (isNaN(f.getTime())) return "-";

    const d = String(f.getDate()).padStart(2, "0");
    const m = String(f.getMonth() + 1).padStart(2, "0");
    const y = f.getFullYear();

    return `${d}/${m}/${y}`;
}

// Construir texto de planes a partir de las columnas del alumno
function construirTextoPlanes(al) {
    const partes = [];

    // En la DB pueden venir como true/false o 1/0
    if (al.plan_eg === true || al.plan_eg === 1) partes.push("Plan EG");
    if (al.plan_personalizado === true || al.plan_personalizado === 1) partes.push("Personalizado");
    if (al.plan_running === true || al.plan_running === 1) partes.push("Running");

    if (partes.length === 0) return "-";

    let texto = partes.join(" + ");

    if (al.dias_semana) {
        texto += ` (${al.dias_semana} días/sem)`;
    }

    return texto;
}

// ------------------------------
// Cargar alumnos desde la API
// ------------------------------
async function cargarAlumnos() {
    const cont = document.getElementById("listaAlumnos");
    cont.innerHTML = "<tr><td colspan='7'>Cargando alumnos...</td></tr>";

    try {
        const res = await fetch(`${API_URL}/alumnos`);
        if (!res.ok) {
            throw new Error("Error HTTP " + res.status);
        }

        const alumnos = await res.json();

        // Mostrar SOLO los activos (activo = 1 / true)
        const activos = alumnos.filter(a =>
            a.activo === true || Number(a.activo) === 1
        );

        if (activos.length === 0) {
            cont.innerHTML = "<tr><td colspan='7'>No hay alumnos activos.</td></tr>";
            return;
        }

        let html = "";

        for (let al of activos) {
            const planesTexto = construirTextoPlanes(al);
            const vencimiento = al.fecha_vencimiento
                ? formatearFecha(al.fecha_vencimiento)
                : "-";

            html += `
                <tr>
                    <td>${al.nombre ?? ""} ${al.apellido ?? ""}</td>
                    <td>${al.dni ?? "-"}</td>
                    <td>${al.nivel ?? "-"}</td>
                    <td>${al.equipo ?? "-"}</td>
                    <td>${planesTexto}</td>
                    <td>${vencimiento}</td>
                    <td>
                        <button class="btn-edit" onclick="editarAlumno(${al.id})">
                            Editar
                        </button>
                    </td>
                </tr>
            `;
        }

        cont.innerHTML = html;

    } catch (err) {
        console.error("Error cargando alumnos:", err);
        cont.innerHTML = "<tr><td colspan='7'>Error cargando alumnos</td></tr>";
    }
}

// Ir al formulario de edición
function editarAlumno(id) {
    window.location.href = `form-alumno.html?id=${id}`;
}

// ------------------------------
// Filtro en tiempo real por nombre o DNI
// ------------------------------
function filtrarAlumnos() {
    const texto = document.getElementById("buscarAlumno").value.toLowerCase();
    const filas = document.querySelectorAll("#listaAlumnos tr");

    filas.forEach(fila => {
        const nombre = (fila.children[0]?.textContent || "").toLowerCase();
        const dni    = (fila.children[1]?.textContent || "").toLowerCase();

        if (nombre.includes(texto) || dni.includes(texto)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

// lo usa el input de búsqueda en alumnos.html con oninput="filtrarAlumnos()"
window.filtrarAlumnos = filtrarAlumnos;
window.editarAlumno = editarAlumno;
