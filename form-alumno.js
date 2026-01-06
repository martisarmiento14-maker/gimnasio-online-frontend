const API_URL = "https://gimnasio-online-1.onrender.com";

// 🔥 VARIABLES GLOBALES
let nombre, apellido, dni, celular, nivel, fecha_vencimiento;
let plan_eg, plan_personalizado, plan_running, plan_mma;
let dias_eg_pers, dias_semana;
let pagoAlta, btnRenovar;

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("editar");

    nombre = document.getElementById("nombre");
    apellido = document.getElementById("apellido");
    dni = document.getElementById("dni");
    celular = document.getElementById("celular");
    nivel = document.getElementById("nivel");
    fecha_vencimiento = document.getElementById("fecha_vencimiento");

    plan_eg = document.getElementById("plan_eg");
    plan_personalizado = document.getElementById("plan_personalizado");
    plan_running = document.getElementById("plan_running");
    plan_mma = document.getElementById("plan_mma");

    dias_eg_pers = document.getElementById("dias_eg_pers");
    dias_semana = document.getElementById("dias_semana");

    pagoAlta = document.getElementById("pagoAltaContainer");
    btnRenovar = document.getElementById("btnRenovar");

    if (id) {
        pagoAlta.style.display = "none";
        btnRenovar.style.display = "inline-block";
        cargarAlumno(id);
    } else {
        pagoAlta.style.display = "block";
        btnRenovar.style.display = "none";
    }

    plan_eg.addEventListener("change", actualizarDias);
    plan_personalizado.addEventListener("change", actualizarDias);
    plan_running.addEventListener("change", actualizarDias);
    plan_mma.addEventListener("change", actualizarDias);


    document.getElementById("formAlumno")
        .addEventListener("submit", guardarAlumno);

    btnRenovar.addEventListener("click", abrirModalRenovar);
});



// =========================================================
// 🔢 CÁLCULO CORRECTO DE DÍAS
// =========================================================
function actualizarDias() {
    const eg = plan_eg.checked;
    const pers = plan_personalizado.checked;
    const run = plan_running.checked;
    const mma = plan_mma.checked;

    const boxEgPers = document.getElementById("diasEgPersContainer");
    const boxTotales = document.getElementById("diasTotalesContainer");

    boxEgPers.style.display = "none";
    boxTotales.style.display = "none";

    // ❌ prohibido
    if (eg && pers) {
        alert("No podés combinar Plan EG con Personalizado.");
        plan_personalizado.checked = false;
        return;
    }

    let total = 0;

    // EG o Personalizado → 3 o 5 días
    if (eg || pers) {
        boxEgPers.style.display = "block";

        dias_eg_pers.innerHTML = `
            <option value="3">3 días</option>
            <option value="5">5 días</option>
        `;

        total += Number(dias_eg_pers.value || 3);
    }

    // Running → 3 días
    if (run) total += 3;

    // MMA → 2 días
    if (mma) total += 2;

    if (total > 0) {
        dias_semana.value = total;
        boxTotales.style.display = "block";
    }

    dias_eg_pers.onchange = actualizarDias;
}
function obtenerPlanPago() {
    const planes = [];

    if (plan_eg.checked) planes.push("eg");
    if (plan_personalizado.checked) planes.push("personalizado");
    if (plan_running.checked) planes.push("running");
    if (plan_mma.checked) planes.push("mma");

    return planes.join("+"); // ej: "eg+running+mma"
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

    fecha_vencimiento.value = a.fecha_vencimiento
        ? a.fecha_vencimiento.split("T")[0]
        : "";

    plan_eg.checked = a.plan_eg;
    plan_personalizado.checked = a.plan_personalizado;
    plan_running.checked = a.plan_running;
    plan_mma.checked = a.plan_mma;

    actualizarDias();

    if (a.dias_eg_pers) dias_eg_pers.value = a.dias_eg_pers;
    dias_semana.value = a.dias_semana;
}


// =========================================================
// 💾 GUARDAR ALUMNO (ALTA O EDICIÓN)
// =========================================================
async function guardarAlumno(e) {
    e.preventDefault();

    const id = new URLSearchParams(window.location.search).get("editar");

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
        dias_eg_pers: dias_eg_pers.value ? Number(dias_eg_pers.value) : null,
        plan_mma: plan_mma.checked
    };

    const res = await fetch(
        id ? `${API_URL}/alumnos/${id}` : `${API_URL}/alumnos`,
        {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        }
    );

    if (!res.ok) {
        alert("❌ Error al guardar alumno");
        return;
    }

    const alumno = await res.json();

    // 🔥 PAGO SOLO EN ALTA
    if (!id) {
        const monto = Number(document.getElementById("monto").value);

        if (isNaN(monto)) {
            alert("Ingresá un monto");
            return;
            }

        const metodo = document.getElementById("metodo_pago").value;

        const plan = obtenerPlanPago();
        const dias = Number(dias_semana.value);


        await fetch(`${API_URL}/pagos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_alumno: alumno.id,
                monto,
                metodo_pago: metodo,
                tipo: "alta",
                plan,
                dias_por_semana: dias
            })
        });

    }


    alert("Alumno guardado correctamente ✅");
    window.location.href = "alumnos.html";
}


// =========================================================
// 🪟 MODAL RENOVAR
// =========================================================
function abrirModalRenovar() {
    document.getElementById("renovarMonto").value = "";
    document.getElementById("renovarMetodo").value = "efectivo";
    document.getElementById("modalRenovar").style.display = "flex";
}

function cerrarModalRenovar() {
    document.getElementById("modalRenovar").style.display = "none";
}


// =========================================================
// 🔁 CONFIRMAR RENOVACIÓN
// =========================================================
async function confirmarRenovacion() {
    const monto = Number(document.getElementById("renovarMonto").value);
    const metodo = document.getElementById("renovarMetodo").value;

    if (monto <= 0) {
        alert("Ingresá un monto válido");
        return;
    }

    const id = new URLSearchParams(window.location.search).get("editar");

    const [y, m, d] = fecha_vencimiento.value.split("-").map(Number);
    const f = new Date(y, m - 1, d);
    f.setMonth(f.getMonth() + 1);

    const nuevaFecha =
        `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;

    // actualizar alumno
    await fetch(`${API_URL}/alumnos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nombre.value,
            apellido: apellido.value,
            dni: dni.value,
            telefono: celular.value,
            nivel: nivel.value,
            fecha_vencimiento: nuevaFecha,
            plan_eg: plan_eg.checked,
            plan_personalizado: plan_personalizado.checked,
            plan_running: plan_running.checked,
            dias_semana: Number(dias_semana.value),
            dias_eg_pers: dias_eg_pers.value ? Number(dias_eg_pers.value) : null
        })
    });

    fecha_vencimiento.value = nuevaFecha;

    // registrar pago
    const plan = obtenerPlanPago();
    const dias = Number(dias_semana.value);


    await fetch(`${API_URL}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_alumno: Number(id),
            monto,
            metodo_pago: metodo,
            tipo: "renovacion",
            plan,
            dias_por_semana: dias
        })
    });

    cerrarModalRenovar();
    alert("Renovación registrada correctamente ✅");
}
