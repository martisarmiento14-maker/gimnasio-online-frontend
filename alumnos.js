const API_URL = "https://gimnasio-online-1.onrender.com";

document.addEventListener("DOMContentLoaded", cargarAlumnos);
document.getElementById("buscador").addEventListener("input", cargarAlumnos);

async function cargarAlumnos() {
    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const alumnos = await res.json();

        const txt = document.getElementById("buscador").value.toLowerCase();

        const filtrados = alumnos.filter(a =>
            a.nombre.toLowerCase().includes(txt) ||
            a.apellido.toLowerCase().includes(txt) ||
            String(a.dni).includes(txt)
        );

        mostrarAlumnos(filtrados);

    } catch (error) {
        console.log("Error cargando alumnos:", error);
    }
}

function formatearFecha(f) {
    if (!f) return "-";
    const fecha = new Date(f);
    return fecha.toLocaleDateString("es-AR");
}

function formatearPlanes(a) {
    let planes = [];

    if (a.plan_eg) planes.push("Plan EG");
    if (a.plan_personalizado) planes.push("Personalizado");
    if (a.plan_running) planes.push("Running (2 días/sem)");

    return planes.join(" + ");
}

function mostrarAlumnos(lista) {
    const tbody = document.getElementById("tablaAlumnosBody");
    tbody.innerHTML = "";

    lista.forEach(a => {
        let tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${a.nombre} ${a.apellido}</td>
            <td>${a.dni}</td>
            <td>${a.nivel}</td>
            <td>${a.equipo}</td>
            <td>${formatearPlanes(a)}</td>
            <td>${formatearFecha(a.fecha_vencimiento)}</td>
            <td><button class="btn-edit" onclick="editar(${a.id})">Editar</button></td>
        `;

        tbody.appendChild(tr);
    });
}

function editar(id) {
    window.location.href = `form-alumno.html?editar=${id}`;
}
