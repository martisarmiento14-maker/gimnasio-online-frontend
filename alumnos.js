// gimnasio-frontend/alumnos.js

document.addEventListener("DOMContentLoaded", cargarAlumnos);

// Formatear fecha dd/mm/aaaa
function formatearFecha(iso) {
    if (!iso) return "-";
    const f = new Date(iso);
    const d = String(f.getDate()).padStart(2, "0");
    const m = String(f.getMonth() + 1).padStart(2, "0");
    const y = f.getFullYear();
    return `${d}/${m}/${y}`;
}

// Construir texto de planes a partir de las columnas del alumno
function construirTextoPlanes(al) {
    const partes = [];

    if (al.plan_eg) partes.push("Plan EG");
    if (al.plan_personalizado) partes.push("Personalizado");
    if (al.plan_running) partes.push("Running");

    if (partes.length === 0) return "-";

    let texto = partes.join(" + ");

    if (al.dias_semana) {
        texto += ` (${al.dias_semana} días/sem)`;
    }

    return texto;
}

async function cargarAlumnos() {
    const cont = document.getElementById("listaAlumnos");
    cont.innerHTML = "<tr><td colspan='7'>Cargando alumnos...</td></tr>";

    try {const res = await fetch("https://gimnasio-backend-u3xo.onrender.com/alumnos");
        const alumnos = await res.json();

        // Mostrar SOLO activos (activo = 1)
        const activos = alumnos.filter(a => Number(a.activo) === 1);


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
                    <td>${al.nombre} ${al.apellido}</td>
                    <td>${al.dni}</td>
                    <td>${al.nivel}</td>
                    <td>${al.equipo}</td>
                    <td>${planesTexto}</td>
                    <td>${vencimiento}</td>
                    <td>
                        <button class="btn-edit" onclick="editarAlumno(${al.id_alumno})">
                            Editar
                        </button>
                    </td>
                </tr>
            `;
        }

        cont.innerHTML = html;

    } catch (err) {
        console.error(err);
        cont.innerHTML = "<tr><td colspan='7'>Error cargando alumnos</td></tr>";
    }
}

function editarAlumno(id) {
    window.location.href = `form-alumno.html?id=${id}`;
}

// === FILTRAR ALUMNOS EN TIEMPO REAL ===
// === FILTRAR ALUMNOS EN TIEMPO REAL ===
function filtrarAlumnos() {
    const texto = document.getElementById("buscarAlumno").value.toLowerCase();

    // 🔹 Filas reales de la tabla (solo el cuerpo, NO el encabezado)
    const filas = document.querySelectorAll("#listaAlumnos tr");

    filas.forEach(fila => {
        // Columna 1 = Nombre + Apellido
        const nombre = (fila.children[0].textContent || "").toLowerCase();
        // Columna 2 = DNI
        const dni = (fila.children[1].textContent || "").toLowerCase();

        if (nombre.includes(texto) || dni.includes(texto)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}
