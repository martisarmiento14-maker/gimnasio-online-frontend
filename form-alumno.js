const API_URL = "https://gimnasio-online-1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");

    const btnRenovar = document.getElementById("btnRenovar");

    if (!id) btnRenovar.style.display = "none";

    plan_eg.addEventListener("change", actualizarDias);
    plan_personalizado.addEventListener("change", actualizarDias);
    plan_running.addEventListener("change", actualizarDias);

    if (id) cargarAlumno(id);

    document.getElementById("formAlumno").addEventListener("submit", guardarAlumno);
    btnRenovar.addEventListener("click", sumarUnMes);
});

// =========================================================
// 🔥 LÓGICA DE DÍAS AUTOMÁTICOS
// =========================================================
function actualizarDias() {
    const eg = plan_eg.checked;
    const pers = plan_personalizado.checked;
    const run = plan_running.checked;

    const boxEgPers = document.getElementById("diasEgPersContainer");
    const boxTotales = document.getElementById("diasTotalesContainer");

    boxEgPers.style.display = "none";
    boxTotales.style.display = "none";

    let diasPlan = 0;
    let diasTotales = 0;

    // ❌ EG + Personalizado no se puede
    if (eg && pers) {
        alert("No podés combinar Plan EG con Plan Personalizado.");
        plan_personalizado.checked = false;
        return;
    }

    // -------------------------
    // ✔ RUNNING SOLO (2)
    // -------------------------
    if (run && !eg && !pers) {
        diasTotales = 2;
        mostrarTotales(diasTotales);
        return;
    }

    // -------------------------
    // ✔ EG SOLO (3 o 5)
    // -------------------------
    if (eg && !run && !pers) {
        boxEgPers.style.display = "block";
        dias_eg_pers.innerHTML = `
            <option value="3">3 días</option>
            <option value="5">5 días</option>
        `;
        diasPlan = Number(dias_eg_pers.value);
        diasTotales = diasPlan;
        mostrarTotales(diasTotales);
        dias_eg_pers.onchange = actualizarDias;
        return;
    }

    // -------------------------
    // ✔ Personalizado SOLO
    // -------------------------
    if (pers && !run && !eg) {
        boxEgPers.style.display = "block";
        dias_eg_pers.innerHTML = `
            <option value="3">3 días</option>
            <option value="5">5 días</option>
        `;
        diasPlan = Number(dias_eg_pers.value);
        diasTotales = diasPlan;
        mostrarTotales(diasTotales);
        dias_eg_pers.onchange = actualizarDias;
        return;
    }

    // -------------------------
    // ✔ EG + RUNNING
    // -------------------------
    if (eg && run) {
        boxEgPers.style.display = "block";
        dias_eg_pers.innerHTML = `
            <option value="3">3 días</option>
            <option value="5">5 días</option>
        `;
        diasPlan = Number(dias_eg_pers.value);
        diasTotales = diasPlan + 2;
        mostrarTotales(diasTotales);
        dias_eg_pers.onchange = actualizarDias;
        return;
    }

    // -------------------------
    // ✔ Personalizado + RUNNING
    // -------------------------
    if (pers && run) {
        boxEgPers.style.display = "block";
        dias_eg_pers.innerHTML = `
            <option value="3">3 días</option>
            <option value="5">5 días</option>
        `;
        diasPlan = Number(dias_eg_pers.value);
        diasTotales = diasPlan + 2;
        mostrarTotales(diasTotales);
        dias_eg_pers.onchange = actualizarDias;
        return;
    }
}

function mostrarTotales(total) {
    const boxTotales = document.getElementById("diasTotalesContainer");
    boxTotales.style.display = "block";
    dias_semana.value = total;
}

// =========================================================
// 🔄 CARGAR ALUMNO
// =========================================================
async function cargarAlumno(id) {
    const res = await fetch(`${API_URL}/alumnos/${id}`);
    const a = await res.json();

    nombre.value = a.nombre;
    apellido.value = a.apellido;
    dni.value = a.dni;
    celular.value = a.telefono ?? "";
    nivel.value = a.nivel;

    fecha_vencimiento.value = new Date(a.fecha_vencimiento)
        .toISOString()
        .split("T")[0];

    plan_eg.checked = a.plan_eg;
    plan_personalizado.checked = a.plan_personalizado;
    plan_running.checked = a.plan_running;

    actualizarDias();

    if (a.dias_eg_pers) dias_eg_pers.value = a.dias_eg_pers;

    dias_semana.value = a.dias_semana;
}

// =========================================================
// 📅 RENOVAR
// =========================================================
function sumarUnMes() {
    let f = new Date(fecha_vencimiento.value);
    f.setMonth(f.getMonth() + 1);
    fecha_vencimiento.value = f.toISOString().split("T")[0];
}

// =========================================================
// 💾 GUARDAR
// =========================================================
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
        dias_semana: Number(dias_semana.value),
        dias_eg_pers: dias_eg_pers.value ? Number(dias_eg_pers.value) : null
    };

    let url = `${API_URL}/alumnos`;
    let method = "POST";

    if (id) {
        url = `${API_URL}/alumnos/${id}`;
        method = "PUT";
    }

    const response = await fetch(url, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(datos)
    });

    if (!response.ok) {
        alert("❌ Error al guardar el alumno.");
        return;
    }

    alert("Alumno guardado con éxito.");
    window.location.href = "alumnos.html";
}
