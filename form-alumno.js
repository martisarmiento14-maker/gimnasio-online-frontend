const API_URL = "https://gimnasio-online-1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");

    if (id) {
        cargarAlumno(id);
    }

    document.getElementById("renovarMes").addEventListener("click", sumarUnMes);
    document.getElementById("formAlumno").addEventListener("submit", guardarAlumno);
});

async function cargarAlumno(id) {
    try {
        const res = await fetch(`${API_URL}/alumnos/${id}`);
        const alumno = await res.json();

        document.getElementById("nombre").value = alumno.nombre;
        document.getElementById("apellido").value = alumno.apellido;
        document.getElementById("dni").value = alumno.dni;
        document.getElementById("telefono").value = alumno.telefono ?? "";

        document.getElementById("nivel").value = alumno.nivel;

        // FECHA FORMATEADA CORRECTAMENTE
        if (alumno.fecha_vencimiento) {
            const fecha = new Date(alumno.fecha_vencimiento);
            document.getElementById("fecha_vencimiento").value = fecha.toISOString().split("T")[0];
        }

        document.getElementById("plan_eg").checked = alumno.plan_eg;
        document.getElementById("plan_personalizado").checked = alumno.plan_personalizado;
        document.getElementById("plan_running").checked = alumno.plan_running;

    } catch (error) {
        console.log("Error cargando alumno:", error);
    }
}

function sumarUnMes() {
    let input = document.getElementById("fecha_vencimiento");
    if (!input.value) return;

    let fecha = new Date(input.value);
    fecha.setMonth(fecha.getMonth() + 1);

    input.value = fecha.toISOString().split("T")[0];
}

async function guardarAlumno(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");

    const datos = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        dni: document.getElementById("dni").value,
        telefono: document.getElementById("telefono").value,
        nivel: document.getElementById("nivel").value,
        fecha_vencimiento: document.getElementById("fecha_vencimiento").value,
        plan_eg: document.getElementById("plan_eg").checked,
        plan_personalizado: document.getElementById("plan_personalizado").checked,
        plan_running: document.getElementById("plan_running").checked,
    };

    try {
        let url = `${API_URL}/alumnos`;
        let method = "POST";

        if (id) {
            url = `${API_URL}/alumnos/${id}`;
            method = "PUT";
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        alert("Alumno guardado correctamente");
        window.location.href = "alumnos.html";

    } catch (error) {
        console.log("Error guardando:", error);
        alert("Hubo un error.");
    }
}
