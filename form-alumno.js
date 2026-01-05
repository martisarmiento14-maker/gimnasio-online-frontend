const API_URL = "https://gimnasio-online-1.onrender.com";

// ================= VARIABLES =================
let nombre, apellido, dni, celular, nivel, fecha_vencimiento;
let plan_eg, plan_personalizado, plan_running;
let dias_eg_pers, dias_semana;
let pagoAlta, btnRenovar;

// ================= INIT =================
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

    document
        .getElementById("formAlumno")
        .addEventListener("submit", guardarAlumno);

    btnRenovar.addEventListener("click", abrirModalRenovar);
});

// ================= DÍAS =================
function actualizarDias() {
    const eg = plan_eg.checked;
    const pers = plan_personalizado.checked;
    const run = plan_running.checked;

    const boxEgPers = document.getElementById("diasEgPersContainer");
    const boxTotales = document.getElementById("diasTotalesContainer");

    boxEgPers.style.display = "none";
    boxTotales.style.display = "none";

    if (eg && pers) {
        alert("No podés combinar Plan EG con Personalizado.");
        plan_personalizado.checked = false;
        return;
    }

    let total = 0;

    if (eg || pers) {
        boxEgPers.style.display = "block";
        dias_eg_pers.innerHTML = `
            <option value="3">3 días</option>
            <option value="5">5 días</option>
        `;
        total += Number(dias_eg_pers.value || 3);
    }

    if (run) total += 2;

    if (total > 0) {
        dias_semana.value = total;
        boxTotales.style.display = "block";
    }

    dias_eg_pers.onchange = actualizarDias;
}

// ================= CARGAR =================
async function cargarAlumno(id) {
    const res = await fetch(`${API_URL}/alumnos/${id}`);
    const a = await res.json();

    nombre.value = a.nombre;
    apellido.value = a.apellido;
    dni.value = a.dni;
    celular.value = a.telefono ?? "";
    nivel.value = a.nivel;
    fecha_vencimiento.value = a.fecha_vencimiento?.split("T")[0] ?? "";

    plan_eg.checked = a.plan_eg;
    plan_personalizado.checked = a.plan_personalizado;
    plan_running.checked = a.plan_running;

    actualizarDias();

    if (a.dias_eg_pers) dias_eg_pers.value = a.dias_eg_pers;
    dias_semana.value = a.dias_semana;
}

// ================= GUARDAR =================
async function guardarAlumno(e) {
    e.preventDefault();

    const btn = document.querySelector(".btn-guardar");
    btn.disabled = true;

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
        dias_eg_pers: dias_eg_pers.value
            ? Number(dias_eg_pers.value)
            : null
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
        alert("Error al guardar alumno");
        btn.disabled = false;
        return;
    }

    const alumno = await res.json();

    // ===== PAGO ALTA =====
    if (!id) {
        const monto = Number(document.getElementById("monto").value);
        const metodo = document.getElementById("metodo_pago").value;

        if (isNaN(monto)) {
            alert("Ingresá un monto válido");
            btn.disabled = false;
            return;
        }

        await fetch(`${API_URL}/pagos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                alumno_id: alumno.id,
                monto,
                metodo_pago: metodo,
                tipo: "alta"
            })
        });
    }

    alert("Alumno guardado correctamente ✅");
    window.location.href = "alumnos.html";
}

// ================= RENOVAR =================
function abrirModalRenovar() {
    document.getElementById("renovarMonto").value = "";
    document.getElementById("renovarMetodo").value = "efectivo";
    document.getElementById("modalRenovar").style.display = "flex";
}

function cerrarModalRenovar() {
    document.getElementById("modalRenovar").style.display = "none";
}

async function confirmarRenovacion() {
    const monto = Number(document.getElementById("renovarMonto").value);
    const metodo = document.getElementById("renovarMetodo").value;

    if (monto <= 0) {
        alert("Ingresá un monto válido");
        return;
    }

    const id = new URLSearchParams(window.location.search).get("editar");

    const f = new Date(fecha_vencimiento.value);
    f.setMonth(f.getMonth() + 1);

    const nuevaFecha = f.toISOString().split("T")[0];

    await fetch(`${API_URL}/alumnos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...{
                nombre: nombre.value,
                apellido: apellido.value,
                dni: dni.value,
                telefono: celular.value,
                nivel: nivel.value,
                plan_eg: plan_eg.checked,
                plan_personalizado: plan_personalizado.checked,
                plan_running: plan_running.checked,
                dias_semana: Number(dias_semana.value),
                dias_eg_pers: dias_eg_pers.value
                    ? Number(dias_eg_pers.value)
                    : null
            },
            fecha_vencimiento: nuevaFecha
        })
    });

    await fetch(`${API_URL}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            alumno_id: Number(id),
            monto,
            metodo_pago: metodo,
            tipo: "renovacion"
        })
    });

    cerrarModalRenovar();
    alert("Renovación registrada correctamente ✅");
}
