const API_URL = "https://gimnasio-online-1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");

    const btnRenovar = document.getElementById("btnRenovar");

    // Ocultar botón renovar si estoy creando
    if (!id) btnRenovar.style.display = "none";

    // Listeners de planes
    plan_eg.addEventListener("change", actualizarDias);
    plan_personalizado.addEventListener("change", actualizarDias);
    plan_running.addEventListener("change", actualizarDias);

    if (id) cargarAlumno(id);

    document.getElementById("formAlumno").addEventListener("submit", guardarAlumno);
    btnRenovar.addEventListener("click", sumarUnMes);
});


// =====================================================================================
// 🔥 FUNCIÓN PRINCIPAL DE PLANES Y DÍAS — REGLAS CORRECTAS DE TU GIMNASIO
// =====================================================================================
function actualizarDias() {
    const eg = plan_eg.checked;
    const pers = plan_personalizado.checked;
    const run = plan_running.checked;

    dias_semana.disabled = false;
    dias_eg_pers.disabled = false;

    // 🚨 REGLA 1 — EG y Personalizado NO pueden combinarse
    if (eg && pers) {
        alert("No podés combinar Plan EG con Plan Personalizado.");
        plan_personalizado.checked = false;
        return;
    }

    // -------------------------
    // CASO 1: RUNNING SOLO (2 días)
    // -------------------------
    if (run && !eg && !pers) {
        dias_eg_pers.innerHTML = "";
        dias_eg_pers.disabled = true;

        dias_semana.innerHTML = `<option value="2">2 días</option>`;
        dias_semana.disabled = true;

        return;
    }

    // -------------------------
    // CASO 2: EG SOLO (3 o 5)
    // -------------------------
    if (eg && !run && !pers) {
        dias_eg_pers.innerHTML = `
            <option value="3">3 días</option>
            <option value="5">5 días</option>
        `;
        dias_semana.innerHTML = dias_eg_pers.innerHTML;

        return;
    }

    // -------------------------
    // CASO 3: PERSONALIZADO SOLO (3 o 5)
    // -------------------------
    if (pers && !eg && !run) {
        dias_eg_pers.innerHTML = `
            <option value="3">3 días</option>
            <option value="5">5 días</option>
        `;
        dias_semana.innerHTML = dias_eg_pers.innerHTML;

        return;
    }

    // -------------------------
    // CASO 4: EG + RUNNING (3 ó 5 + 2)
    // -------------------------
    if (eg && run) {
        dias_eg_pers.innerHTML = `
            <option value="3">3 días EG</option>
            <option value="5">5 días EG</option>
        `;

        dias_semana.innerHTML = `
            <option value="5">5 días totales</option>
            <option value="7">7 días totales</option>
        `;
        dias_semana.disabled = true;

        return;
    }

    // -------------------------
    // CASO 5: PERSONALIZADO + RUNNING (3 ó 5 + 2)
    // -------------------------
    if (pers && run) {
        dias_eg_pers.innerHTML = `
            <option value="3">3 días Personalizado</option>
            <option value="5">5 días Personalizado</option>
        `;

        dias_semana.innerHTML = `
            <option value="5">5 días totales</option>
            <option value="7">7 días totales</option>
        `;
        dias_semana.disabled = true;

        return;
    }
}


// =====================================================================================
// 🔄 CARGAR DATOS EN EDITAR
// =====================================================================================
async function cargarAlumno(id) {
    const res = await fetch(`${API_URL}/alumnos/${id}`);
    const a = await res.json();

    nombre.value = a.nombre;
    apellido.value = a.apellido;
    dni.value = a.dni;
    celular.value = a.telefono ?? "";
    nivel.value = a.nivel;

    if (a.fecha_vencimiento) {
        fecha_vencimiento.value = new Date(a.fecha_vencimiento)
            .toISOString()
            .split("T")[0];
    }

    plan_eg.checked = a.plan_eg;
    plan_personalizado.checked = a.plan_personalizado;
    plan_running.checked = a.plan_running;

    actualizarDias();

    if (a.dias_eg_pers) dias_eg_pers.value = a.dias_eg_pers;
    if (a.dias_semana) dias_semana.value = a.dias_semana;
}


// =====================================================================================
// 📅 RENOVAR +1 MES
// =====================================================================================
function sumarUnMes() {
    let f = new Date(fecha_vencimiento.value);
    f.setMonth(f.getMonth() + 1);
    fecha_vencimiento.value = f.toISOString().split("T")[0];
}


// =====================================================================================
// 💾 GUARDAR (CREAR O EDITAR)
// =====================================================================================
async function guardarAlumno(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");

    // Running solo → 2 días
    let diasTotales = dias_semana.value;
    let diasEgPers = dias_eg_pers.disabled ? null : dias_eg_pers.value;

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
        dias_semana: Number(diasTotales),
        dias_eg_pers: diasEgPers ? Number(diasEgPers) : null
    };

    let url = `${API_URL}/alumnos`;
    let method = "POST";

    if (id) {
        url = `${API_URL}/alumnos/${id}`;
        method = "PUT";
    }

    await fetch(url, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(datos)
    });

    alert("Guardado correctamente.");
    window.location.href = "alumnos.html";
}
