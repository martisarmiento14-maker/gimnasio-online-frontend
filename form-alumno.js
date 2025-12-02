const API_URL = "https://gimnasio-online-1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");

    const btnRenovar = document.getElementById("btnRenovar");

    // Ocultar renovar si estoy creando
    if (!id) btnRenovar.style.display = "none";

    // Listeners de planes
    document.getElementById("plan_eg").addEventListener("change", actualizarDias);
    document.getElementById("plan_personalizado").addEventListener("change", actualizarDias);
    document.getElementById("plan_running").addEventListener("change", actualizarDias);

    if (id) cargarAlumno(id);

    document.getElementById("formAlumno").addEventListener("submit", guardarAlumno);
    btnRenovar.addEventListener("click", sumarUnMes);
});

function actualizarDias() {
    const eg = plan_eg.checked;
    const pers = plan_personalizado.checked;

    if (!eg && !pers) {
        dias_semana.innerHTML = `<option value="">Elegí un plan primero</option>`;
        dias_semana.disabled = true;
        return;
    }

    dias_semana.disabled = false;
    dias_semana.innerHTML = `
        <option value="1">1 día</option>
        <option value="2">2 días</option>
        <option value="3">3 días</option>
        <option value="4">4 días</option>
        <option value="5">5 días</option>
    `;
}

async function cargarAlumno(id) {
    const res = await fetch(`${API_URL}/alumnos/${id}`);
    const a = await res.json();

    nombre.value = a.nombre;
    apellido.value = a.apellido;
    dni.value = a.dni;
    celular.value = a.telefono ?? "";

    nivel.value = a.nivel;

    // fecha
    if (a.fecha_vencimiento) {
        fecha_vencimiento.value = new Date(a.fecha_vencimiento)
            .toISOString()
            .split("T")[0];
    }

    plan_eg.checked = a.plan_eg;
    plan_personalizado.checked = a.plan_personalizado;
    plan_running.checked = a.plan_running;

    actualizarDias();

    if (a.dias_semana) dias_semana.value = a.dias_semana;
}

function sumarUnMes() {
    let f = new Date(fecha_vencimiento.value);
    f.setMonth(f.getMonth() + 1);
    fecha_vencimiento.value = f.toISOString().split("T")[0];
}

async function guardarAlumno(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");

    const datos = {
        nombre: nombre.value,
        apellido: apellido.value,
        dni: dni.value,
        telefono: celular.value,
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
