const API_URL = "https://gimnasio-online-frontend.onrender.com" || "http://localhost:3000";

const tablaBody = document.getElementById("tablaAlumnosBody");
const buscador = document.getElementById("buscador");

document.addEventListener("DOMContentLoaded", cargarAlumnos);
buscador.addEventListener("input", cargarAlumnos);

function formatearPlanes(a) {
    let planes = [];

    if (a.plan_eg) planes.push(`Plan EG (${a.dias_eg_pers} días/sem)`);
    if (a.plan_personalizado) planes.push(`Personalizado (${a.dias_eg_pers} días/sem)`);
    if (a.plan_running) planes.push(`Running (2 días/sem)`);

    return planes.join(" + ");
}

function formatFecha(f) {
    return new Date(f).toLocaleDateString("es-AR");
}

async function cargarAlumnos() {
    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const data = await res.json();

        let txt = buscador.value.toLowerCase();

        let filtrados = data.filter(a =>
            a.nombre.toLowerCase().includes(txt) ||
            a.apellido.toLowerCase().includes(txt) ||
            String(a.dni).includes(txt)
        );

        mostrarTabla(filtrados);
    } catch (error) {
        console.log("Error cargando alumnos:", error);
    }
}

function mostrarTabla(lista) {
    tablaBody.innerHTML = "";

    lista.forEach(a => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${a.nombre} ${a.apellido}</td>
            <td>${a.dni}</td>
            <td>${a.nivel}</td>
            <td>${a.equipo}</td>
            <td>${formatearPlanes(a)}</td>
            <td>${formatFecha(a.fecha_vencimiento)}</td>
            <td><button class="btn-edit" onclick="editarAlumno(${a.id})">Editar</button></td>
        `;

        tablaBody.appendChild(tr);
    });
}

function editarAlumno(id) {
    window.location.href = `form-alumno.html?editar=${id}`;
}

