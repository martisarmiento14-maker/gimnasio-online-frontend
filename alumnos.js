// alumnos.js
const API_URL = "https://gimnasio-online-1.onrender.com";

let alumnoActual = null;

// INPUT DNI - presiona ENTER para buscar
document.getElementById("dniBuscar").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        buscarAlumno();
    }
});

// ==========================
// BUSCAR ALUMNO POR DNI
// ==========================
async function buscarAlumno() {
    const dni = document.getElementById("dniBuscar").value.trim();
    if (!dni) return alert("Ingresá un DNI");

    try {
        const res = await fetch(`${API_URL}/alumnos/dni/${dni}`);
        if (!res.ok) {
            alert("Alumno no encontrado");
            return;
        }

        alumnoActual = await res.json();

        // cargar en formulario
        document.getElementById("nombre").value = alumnoActual.nombre;
        document.getElementById("apellido").value = alumnoActual.apellido;
        document.getElementById("telefono").value = alumnoActual.telefono || "";
        document.getElementById("nivel").value = alumnoActual.nivel || "";
        document.getElementById("dias_semana").value = alumnoActual.dias_semana || 0;

        document.getElementById("plan_eg").checked = alumnoActual.plan_eg;
        document.getElementById("plan_personalizado").checked = alumnoActual.plan_personalizado;
        document.getElementById("plan_running").checked = alumnoActual.plan_running;

        if (alumnoActual.fecha_vencimiento) {
            document.getElementById("fecha_vencimiento").value =
                alumnoActual.fecha_vencimiento.split("T")[0];
        }

    } catch (err) {
        console.error("ERROR buscar alumno:", err);
        alert("Error al conectar con el servidor");
    }
}

// ==========================
// GUARDAR CAMBIOS
// ==========================
document.getElementById("guardarBtn").addEventListener("click", async () => {
    if (!alumnoActual) {
        return alert("Primero buscá un alumno por DNI");
    }

    const datos = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        dni: alumnoActual.dni,
        telefono: document.getElementById("telefono").value,
        nivel: document.getElementById("nivel").value,
        dias_semana: parseInt(document.getElementById("dias_semana").value),

        plan_eg: document.getElementById("plan_eg").checked,
        plan_personalizado: document.getElementById("plan_personalizado").checked,
        plan_running: document.getElementById("plan_running").checked,

        fecha_vencimiento: document.getElementById("fecha_vencimiento").value
    };

    try {
        const res = await fetch(`${API_URL}/alumnos/${alumnoActual.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (!res.ok) {
            alert("Error al guardar cambios");
            return;
        }

        alert("Cambios guardados correctamente ✔");

    } catch (err) {
        console.error("ERROR guardar alumno:", err);
        alert("Error al conectar con el servidor");
    }
});
