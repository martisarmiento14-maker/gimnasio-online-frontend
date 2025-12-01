const API = "https://gimnasio-backend-u3xo.onrender.com/planes";

let editandoId = null;

// ============================
// Cargar tabla
// ============================
document.addEventListener("DOMContentLoaded", cargarPlanes);

async function cargarPlanes() {
    const tbody = document.getElementById("tablaPlanes");
    tbody.innerHTML = "<tr><td colspan='4'>Cargando...</td></tr>";

    const res = await fetch(API);
    const planes = await res.json();

    tbody.innerHTML = "";

    for (const p of planes) {
        const dias = await fetch(`${API}/${p.id_plan}/dias`).then(r => r.json());

        let htmlDias = dias.map(d => `
            <span>${d.valor_dia} 
                <button class="btn-edit" style="padding:4px;" onclick="eliminarDia(${p.id_plan}, ${d.id_dia})">×</button>
            </span>
        `).join(" ");

        if (p.es_running) {
            htmlDias = "<strong>2 (fijo)</strong>";
        }

        const fila = `
            <tr>
                <td>${p.nombre_plan}</td>
                <td>${htmlDias}</td>
                <td>${p.es_running ? "Running" : "General"}</td>
                <td>
                    <button class="btn-edit" onclick="abrirEditarPlan(${p.id_plan})">Editar</button>
                    <button class="btn-guardar" onclick="agregarDia(${p.id_plan})">+ Día</button>
                    <button class="btn-guardar" onclick="eliminarPlan(${p.id_plan})">Eliminar</button>
                </td>
            </tr>
        `;

        tbody.innerHTML += fila;
    }
}

// ============================
// AGREGAR DÍA
// ============================
async function agregarDia(id_plan) {
    const nuevo = prompt("Ingresá un nuevo día permitido (ej: 3, 5, 7):");

    if (!nuevo || nuevo <= 0) return alert("Valor inválido");

    const res = await fetch(`${API}/${id_plan}/dias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor_dia: nuevo })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    cargarPlanes();
}

// ============================
// ELIMINAR DÍA
// ============================
async function eliminarDia(id_plan, id_dia) {
    if (!confirm("¿Eliminar este día permitido?")) return;

    const res = await fetch(`${API}/${id_plan}/dias/${id_dia}`, {
        method: "DELETE"
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    cargarPlanes();
}

// ============================
// ABRIR MODAL: EDITAR PLAN
// ============================
async function abrirEditarPlan(id) {
    editandoId = id;

    const res = await fetch(`${API}`);
    const planes = await res.json();

    const p = planes.find(x => x.id_plan === id);

    document.getElementById("tituloModal").textContent = "Editar plan";
    document.getElementById("nombrePlan").value = p.nombre_plan;
    document.getElementById("esRunning").checked = p.es_running == 1;

    abrirModal();
}

// ============================
// NUEVO PLAN
// ============================
function abrirNuevoPlan() {
    editandoId = null;
    document.getElementById("tituloModal").textContent = "Nuevo plan";
    document.getElementById("nombrePlan").value = "";
    document.getElementById("esRunning").checked = false;
    abrirModal();
}

// ============================
// GUARDAR PLAN
// ============================
document.getElementById("guardarPlan").addEventListener("click", async () => {

    const nombre = document.getElementById("nombrePlan").value.trim();
    const isRun = document.getElementById("esRunning").checked;

    if (!nombre) return alert("El nombre es obligatorio");

    const data = {
        nombre_plan: nombre,
        dias_por_semana: isRun ? 2 : 1, // placeholder
        es_running: isRun ? 1 : 0
    };

    let res;
    if (editandoId === null) {
        res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    } else {
        res = await fetch(`${API}/${editandoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    }

    const json = await res.json();
    if (!res.ok) {
        alert(json.error);
        return;
    }

    cerrarModal();
    cargarPlanes();
});

// ============================
// BORRAR PLAN
// ============================
async function eliminarPlan(id) {
    if (!confirm("¿Eliminar este plan?")) return;

    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    const js = await res.json();

    if (!res.ok) return alert(js.error);

    cargarPlanes();
}

// ============================
// MODAL
// ============================
function abrirModal() {
    document.getElementById("modalPlan").style.display = "block";
}
function cerrarModal() {
    document.getElementById("modalPlan").style.display = "none";
}
