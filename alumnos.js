const API_URL = "https://gimnasio-online-1.onrender.com";

async function cargarAlumnos() {
    const cont = document.getElementById("listaAlumnos");
    cont.innerHTML = "<tr><td colspan='7'>Cargando alumnos...</td></tr>";

    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const alumnos = await res.json();

        let html = "";

        for (let al of alumnos) {
            const planes = obtenerPlanesTexto(al);

            html += `
                <tr>
                    <td>${al.nombre} ${al.apellido}</td>
                    <td>${al.dni ?? "-"}</td>
                    <td>${al.nivel ?? "-"}</td>
                    <td>${al.equipo ?? "-"}</td>
                    <td>${planes}</td>
                    <td>${formatearFecha(al.fecha_vencimiento)}</td>

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
        console.error(err);
        cont.innerHTML = "<tr><td colspan='7'>Error cargando alumnos</td></tr>";
    }
}

function obtenerPlanesTexto(al) {
    let planes = [];

    if (al.plan_eg === true || al.plan_eg === 1) planes.push("EG");
    if (al.plan_personalizado === true || al.plan_personalizado === 1) planes.push("Personalizado");
    if (al.plan_running === true || al.plan_running === 1) planes.push("Running");

    return planes.length ? planes.join(" + ") : "-";
}

function formatearFecha(f) {
    if (!f) return "-";
    return f.split("T")[0];
}

function editarAlumno(id) {
    window.location.href = `form-alumno.html?id=${id}`;
}
