console.log("ADMIN JS VERSION FINAL DEFINITIVO");

// URL DEL BACKEND
const API = "https://gimnasio-online.onrender-1.com";

// Cargar la tabla al iniciar
document.addEventListener("DOMContentLoaded", cargarTablaAdmin);

// ----------------------------
// CARGAR TABLA
// ----------------------------
function cargarTablaAdmin() {
    fetch(`${API}/alumnos`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#tablaAdmin tbody");
            tbody.innerHTML = "";

            data.forEach(al => {
                let fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${al.id}</td>
                    <td>${al.nombre}</td>
                    <td>${al.apellido}</td>

                    <td>
                        <select onchange="cambiarEquipo(${al.id}, this.value)">
                            <option value="Blanco" ${al.equipo === "Blanco" ? "selected" : ""}>Blanco</option>
                            <option value="Morado" ${al.equipo === "Morado" ? "selected" : ""}>Morado</option>
                        </select>
                    </td>

                    <td>
                        <select onchange="cambiarEstado(${al.id}, this.value)">
                            <option value="Activo" ${al.estado === "Activo" ? "selected" : ""}>Activo</option>
                            <option value="Inactivo" ${al.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
                        </select>
                    </td>

                    <td>
                        <button class="delete-btn" onclick="borrarAlumno(${al.id})">🗑</button>
                    </td>
                `;

                tbody.appendChild(fila);
            });
        })
        .catch(err => console.error("Error cargando tabla:", err));
}

// ----------------------------
// CAMBIAR EQUIPO
// ----------------------------
function cambiarEquipo(id, nuevoEquipo) {
    fetch(`${API}/admin/equipo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipo: nuevoEquipo })
    })
    .then(res => res.json())
    .then(() => cargarTablaAdmin());
}

// ----------------------------
// CAMBIAR ESTADO
// ----------------------------
function cambiarEstado(id, estado) {
    fetch(`${API}/admin/estado/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado })
    })
    .then(res => res.json())
    .then(() => cargarTablaAdmin());
}

// ----------------------------
// BORRAR ALUMNO
// ----------------------------
function borrarAlumno(id) {
    if (!confirm("¿Seguro que querés borrar este alumno?")) return;

    fetch(`${API}/admin/borrar/${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => cargarTablaAdmin());
}

// ----------------------------
// LOGOUT
// ----------------------------
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
