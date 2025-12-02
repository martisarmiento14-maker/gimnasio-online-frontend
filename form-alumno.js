const API_URL = "https://gimnasio-online-1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");

    // Ocultar renovar si estoy creando
    if (!id) {
        document.getElementById("renovarMes").style.display = "none";
    }

    // Listeners de planes
    document.getElementById("plan_eg").addEventListener("change", actualizarDias);
    document.getElementById("plan_personalizado").addEventListener("change", actualizarDias);
    document.getElementById("plan_running").addEventListener("change", actualizarDias);

    if (id) cargarAlumno(id);

    document.getElementById("formAlumno").addEventListener("submit", guardarAlumno);
    document.getElementById("renovarMes").addEventListener("click", sumarUnMes);
});

function actualizarDias() {
    const eg = document.getElementById("plan_eg").checked;
    const pers = document.getElementById("plan_personalizado").checked;

    const select = document.getElementById("dias_semana");

    if (!eg && !pers) {
        select.innerHTML = `<option value="">Elegí un plan primero</option>`;
        select.disabled = true;
        return;
    }

    select.disabled = false;
    select.innerHTML = `
        <option value="1">1 día por semana</option>
        <option value="2">2 días por semana</option>
        <option value="3">3 días por semana</option>
        <option value="4">4 días por semana</option>
        <option value="5">5 días por semana</option>
    `;
}

async function cargarAlumno(id) {
    try {
        const res = await fetch(`${API_URL}/alumnos/${id}`);
        const a = await res.json();

        // inputs normales
        document.getElementById("nombre").value = a.nombre;
        document.getElementById("apellido").value = a.apellido;
        document.getElementById("dni").value = a.dni;
        document.getElementById("telefono").value = a.telefono ?? "";

        document.getElementById("nivel").value = a.nivel;

        // fecha
        if (a.fecha_vencimiento) {
            const f = new Date(a.fecha_vencimiento).toISOString().split("T")[0];
            document.getElementById("fecha_vencimiento").value = f;
        }

        // planes
        document.getElementById("plan_eg").checked = a.plan_eg;
        document.getElementById("plan_personalizado").checked = a.plan_personalizado;
        document.getElementById("plan_running").checked = a.plan_running;

        actualizarDias();

        // días: a.dias_semana o a.dias_eg_pers
        if (a.dias_semana) {
            document.getElementById("dias_semana").value = a.dias_semana;
        }
        if (a.dias_eg_pers) {
            document.getElementById("dias_semana").value = a.dias_eg_pers;
        }

    } catch (error) {
        console.log("Error cargando alumno:", error);
    }
}

function sumarUnMes() {
    const input = document.getElementById("fecha_vencimiento");
    let f = new Date(input.value);
    f.setMonth(f.getMonth() + 1);
    input.value = f.toISOString().split("T")[0];
}

async function guardarAlumno(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");

    const datos = {
        nombre: nombre.value,
        apellido: apellido.value,
        dni: dni.value,
        telefono: telefono.value,
        nivel: nivel.value,
        fecha_vencimiento: fecha_vencimiento.value,
        plan_eg: plan_eg.checked,
        plan_personalizado: plan_personalizado.checked,
        plan_running: plan_running.checked,
        dias_semana: dias_semana.value,
        dias_eg_pers: dias_semana.value
    };

    let url = `${API_URL}/alumnos`;
    let method = "POST";

    if (id) {
        url = `${API_URL}/alumnos/${id}`;
        method = "PUT";
    }

    const res = await fetch(url, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(datos)
    });

    alert("Guardado correctamente.");
    window.location.href = "alumnos.html";
}
