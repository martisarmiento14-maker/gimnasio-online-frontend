const API_URL = "https://gimnasio-online-backend.onrender.com";

// Elementos del DOM
const listaAlumnos = document.getElementById("listaAlumnos");
const buscador = document.getElementById("buscador");

// ===============================
//   CARGAR TODOS LOS ALUMNOS
// ===============================
async function cargarAlumnos() {
    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const alumnos = await res.json();

        mostrarAlumnos(alumnos);

        // Activar búsqueda dinámica
        buscador.addEventListener("input", () => {
            const texto = buscador.value.toLowerCase();
            const filtrados = alumnos.filter(a =>
                a.nombre.toLowerCase().includes(texto) ||
                a.apellido.toLowerCase().includes(texto) ||
                a.dni.toString().includes(texto)
            );
            mostrarAlumnos(filtrados);
        });

    } catch (error) {
        console.error("ERROR CARGANDO ALUMNOS:", error);
        listaAlumnos.innerHTML = "<p>Error al cargar alumnos.</p>";
    }
}

cargarAlumnos();


// ===============================
//   MOSTRAR LISTA DE ALUMNOS
// ===============================
function mostrarAlumnos(alumnos) {
    listaAlumnos.innerHTML = "";

    if (alumnos.length === 0) {
        listaAlumnos.innerHTML = "<p>No hay alumnos para mostrar.</p>";
        return;
    }

    alumnos.forEach(alumno => {
        const div = document.createElement("div");
        div.classList.add("alumno-card");

        div.innerHTML = `
            <h3>${alumno.nombre} ${alumno.apellido}</h3>

            <p><strong>DNI:</strong> ${alumno.dni}</p>
            <p><strong>Celular:</strong> ${alumno.telefono || "-"}</p>
            <p><strong>Nivel:</strong> ${alumno.nivel || "-"}</p>

            <p><strong>Planes:</strong>
                ${alumno.plan_eg ? "EG " : ""}
                ${alumno.plan_personalizado ? "Personalizado " : ""}
                ${alumno.plan_running ? "Running" : ""}
            </p>

            <p><strong>Días por semana:</strong> ${alumno.dias_semana}</p>

            <p><strong>Vence:</strong> ${
                alumno.fecha_vencimiento
                    ? alumno.fecha_vencimiento.split("T")[0]
                    : "Sin fecha"
            }</p>

            <div class="acciones">
                <button class="btn-editar" onclick="editarAlumno(${alumno.id})">
                    Editar
                </button>

                <a class="btn-wsp" href="https://wa.me/${alumno.telefono}" target="_blank">
                    WhatsApp
                </a>
            </div>
        `;

        listaAlumnos.appendChild(div);
    });
}


// ===============================
//   IR A EDITAR
// ===============================
function editarAlumno(id) {
    window.location.href = `form-alumno.html?id=${id}`;
}
