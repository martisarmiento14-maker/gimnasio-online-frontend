const API_URL = "https://gimnasio-online-backend.onrender.com";

// ===============================
// Obtener parámetros (crear/editar)
// ===============================
const params = new URLSearchParams(window.location.search);
const alumnoId = params.get("id"); // null = crear, número = editar

// Elementos del formulario
const form = document.getElementById("formAlumno");

const nombre = document.getElementById("nombre");
const apellido = document.getElementById("apellido");
const dni = document.getElementById("dni");
const celular = document.getElementById("celular");
const nivel = document.getElementById("nivel");
const fechaVenc = document.getElementById("fecha_vencimiento");

const planEG = document.getElementById("plan_eg");
const planPers = document.getElementById("plan_personalizado");
const planRun = document.getElementById("plan_running");

const diasEgPersContainer = document.getElementById("diasEgPersContainer");
const diasEgPers = document.getElementById("dias_eg_pers");

const diasSemana = document.getElementById("dias_semana");
const ayudaDias = document.getElementById("ayudaDias");

const btnRenovar = document.getElementById("btnRenovar");

// ===============================
// Cargar datos si es edición
// ===============================
if (alumnoId) {
    cargarAlumno();
    btnRenovar.style.display = "inline-block";
    document.getElementById("tituloForm").textContent = "Editar Alumno";
} else {
    btnRenovar.style.display = "none";
    document.getElementById("tituloForm").textContent = "Nuevo Alumno";
}



// ===============================
// CARGAR ALUMNO
// ===============================
async function cargarAlumno() {
    try {
        const res = await fetch(`${API_URL}/alumnos/${alumnoId}`);
        const data = await res.json();

        nombre.value = data.nombre;
        apellido.value = data.apellido;
        dni.value = data.dni;
        celular.value = data.telefono;
        nivel.value = data.nivel;
        fechaVenc.value = data.fecha_vencimiento ? data.fecha_vencimiento.split("T")[0] : "";

        // Planes
        planEG.checked = data.plan_eg;
        planPers.checked = data.plan_personalizado;
        planRun.checked = data.plan_running;

        // Mostrar select EG/Pers si corresponde
        if (data.plan_eg || data.plan_personalizado) {
            diasEgPersContainer.style.display = "flex";
            diasEgPers.value = data.dias_eg_pers || "3";
        }

        // Días totales
        diasSemana.innerHTML = `<option value="${data.dias_semana}" selected>${data.dias_semana} días</option>`;
        ayudaDias.textContent = "Se calculó según los planes del alumno.";

    } catch (error) {
        alert("Error cargando alumno.");
        console.error(error);
    }
}


// ===============================
// VALIDAR PLANES
// ===============================
function validarPlanes() {
    // EG + Personalizado → no permitido
    if (planEG.checked && planPers.checked) {
        alert("No se puede activar Plan EG y Personalizado al mismo tiempo.");
        planPers.checked = false;
    }

    // Mostrar select de días EG/Pers si corresponde
    if (planEG.checked || planPers.checked) {
        diasEgPersContainer.style.display = "flex";
    } else {
        diasEgPersContainer.style.display = "none";
    }

    calcularDias();
}

planEG.addEventListener("change", validarPlanes);
planPers.addEventListener("change", validarPlanes);
planRun.addEventListener("change", calcularDias);
diasEgPers.addEventListener("change", calcularDias);


// ===============================
// CALCULAR DÍAS TOTALES
// ===============================
function calcularDias() {
    let total = 0;

    // EG o Personalizado
    if (planEG.checked || planPers.checked) {
        total += parseInt(diasEgPers.value);
    }

    // Running suma 2 siempre
    if (planRun.checked) {
        total += 2;
    }

    if (total === 0) {
        diasSemana.innerHTML = `<option value="">Elegí un plan primero</option>`;
        ayudaDias.textContent = "";
        return;
    }

    diasSemana.innerHTML = `<option value="${total}" selected>${total} días</option>`;
    ayudaDias.textContent = "Se calcula automáticamente según los planes.";
}


// ===============================
// RENOVAR CUOTA (+1 mes)
// ===============================
btnRenovar.addEventListener("click", async () => {
    try {
        const res = await fetch(`${API_URL}/alumnos/${alumnoId}/renovar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();

        fechaVenc.value = data.fecha_vencimiento.split("T")[0];
        alert("Cuota renovada correctamente");

    } catch (err) {
        console.error(err);
        alert("Error renovando cuota");
    }
});


// ===============================
// GUARDAR (crear o editar)
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const alumnoData = {
        nombre: nombre.value,
        apellido: apellido.value,
        dni: dni.value,
        telefono: celular.value,
        nivel: nivel.value,
        fecha_vencimiento: fechaVenc.value,

        plan_eg: planEG.checked,
        plan_personalizado: planPers.checked,
        plan_running: planRun.checked,

        dias_eg_pers: planEG.checked || planPers.checked ? parseInt(diasEgPers.value) : 0,
        dias_semana: diasSemana.value ? parseInt(diasSemana.value) : 0
    };

    try {
        let url = `${API_URL}/alumnos`;
        let method = "POST";

        if (alumnoId) {
            url = `${API_URL}/alumnos/${alumnoId}`;
            method = "PUT";
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alumnoData)
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.error || "Error guardando alumno");
            return;
        }

        alert("Alumno guardado correctamente");
        window.location.href = "alumnos.html";

    } catch (err) {
        alert("Error guardando alumno");
        console.error(err);
    }
});
