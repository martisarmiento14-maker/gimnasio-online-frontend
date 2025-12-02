const API = "https://gimnasio-online-1.onrender.com/admin";

document.addEventListener("DOMContentLoaded", cargarAlumnos);

/* ==============================
   CARGAR TABLA COMPLETA
============================== */
async function cargarAlumnos() {
    const res = await fetch(API);
    const alumnos = await res.json();

    const tbody = document.querySelector("#tabla-alumnos");
    tbody.innerHTML = "";

    alumnos.forEach(a => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${a.id}</td>
            <td>${a.nombre}</td>
            <td>${a.apellido}</td>
            <td>
                <select onchange="cambiarEquipo(${a.id}, this.value)">
                    <option value="morado" ${a.equipo === "morado" ? "selected":""}>Morado</option>
                    <option value="blanco" ${a.equipo === "blanco" ? "selected":""}>Blanco</option>
                </select>
            </td>
            <td>
                <button onclick="toggleEstado(${a.id}, ${a.activo})" class="${a.activo ? "desactivar" : "activar"}">
                    ${a.activo ? "Desactivar" : "Activar"}
                </button>
            </td>
            <td>
                <button onclick="borrarAlumno(${a.id})" class="borrar">🗑️</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/* ==============================
   CAMBIAR EQUIPO
============================== */
async function cambiarEquipo(id, equipo) {
    await fetch(`${API}/${id}/equipo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipo }),
    });

    cargarAlumnos();
}

/* ==============================
   ACTIVAR / DESACTIVAR
============================== */
async function toggleEstado(id, activo) {

    const ruta = activo ? "desactivar" : "activar";

    await fetch(`${API}/${id}/${ruta}`, {
        method: "PUT"
    });

    cargarAlumnos();
}

/* ==============================
   BORRAR ALUMNO
============================== */
async function borrarAlumno(id) {
    if (!confirm("¿Seguro que querés borrar este alumno?")) return;

    await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    cargarAlumnos();
}
