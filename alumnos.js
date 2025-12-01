const API_URL = "https://gimnasio-online-1.onrender.com";

async function cargarAlumnos() {
    const cont = document.getElementById("listaAlumnos");
    cont.innerHTML = "<tr><td colspan='7'>Cargando alumnos...</td></tr>";

    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const alumnos = await res.json();

        // Mostrar SOLO activos si tu tabla tuviera ese campo
        // pero ahora no existe, así que MOSTRAMOS TODOS
        // const activos = alumnos.filter(a => Number(a.activo) === 1);

        let html = "";

        for (let al of alumnos) {
            html += `
                <tr>
                    <td>${al.nombre} ${al.apellido}</td>
                    <td>${al.email}</td>
                    <td>${al.edad}</td>
                    <td>${al.telefono}</td>
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
