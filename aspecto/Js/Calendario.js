// Variables globales
const listaCultivos = document.getElementById('lista-cultivos');
const formCultivos = document.getElementById('form-cultivos');
const tablaCalendario = document.getElementById('tabla-calendario');
const mesActual = document.getElementById('mes-actual');
let fechaActual = new Date();

// Cargar datos desde localStorage
let cultivos = JSON.parse(localStorage.getItem('cultivos')) || [];

// Mostrar cultivos al cargar la página
actualizarListaCultivos();
mostrarCalendario(fechaActual);

// Manejar envío del formulario
formCultivos.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre-cultivo').value;
    const area = document.getElementById('area').value;
    const fechaSiembra = document.getElementById('fecha-siembra').value;

    if (nombre && area > 0 && fechaSiembra) {
        const nuevoCultivo = { nombre, area, fechaSiembra };
        cultivos.push(nuevoCultivo);
        localStorage.setItem('cultivos', JSON.stringify(cultivos));
        actualizarListaCultivos(); // Actualiza lista y calendario
        formCultivos.reset();
    }
});

// Actualizar la lista de cultivos y calendario
function actualizarListaCultivos() {
    const cuerpoTablaCultivos = document.getElementById('cuerpo-tabla-cultivos');
    cuerpoTablaCultivos.innerHTML = ''; // Limpiar la tabla antes de agregar los cultivos

    cultivos.forEach((cultivo, index) => {
        const fila = document.createElement('tr');
        
        // Crear celdas para cada dato del cultivo
        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = cultivo.nombre;
        
        const celdaArea = document.createElement('td');
        celdaArea.textContent = cultivo.area;
        
        const celdaFechaSiembra = document.createElement('td');
        celdaFechaSiembra.textContent = cultivo.fechaSiembra;
        
        const celdaAcciones = document.createElement('td');
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.onclick = () => eliminarCultivo(index); // Función eliminar cultivo
        celdaAcciones.appendChild(botonEliminar);
        
        // Añadir las celdas a la fila
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaArea);
        fila.appendChild(celdaFechaSiembra);
        fila.appendChild(celdaAcciones);
        
        // Añadir la fila a la tabla
        cuerpoTablaCultivos.appendChild(fila);
    });

    mostrarCalendario(fechaActual); // Actualiza el calendario
}

// Eliminar cultivo
function eliminarCultivo(index) {
    cultivos.splice(index, 1);
    localStorage.setItem('cultivos', JSON.stringify(cultivos));
    actualizarListaCultivos(); // Actualiza lista y calendario
}

// Mostrar calendario
function mostrarCalendario(fecha) {
    const mes = fecha.getMonth();
    const anio = fecha.getFullYear();
    mesActual.textContent = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    tablaCalendario.innerHTML = '';

    let diaSemana = primerDia.getDay();
    let fila = document.createElement('tr');
    for (let i = 0; i < diaSemana; i++) {
        fila.appendChild(document.createElement('td'));
    }

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const celda = document.createElement('td');
        celda.textContent = dia;
        const fechaActual = new Date(anio, mes, dia).toISOString().split('T')[0];

        if (cultivos.some(c => c.fechaSiembra === fechaActual)) {
            celda.classList.add('evento');
        }

        celda.addEventListener('click', () => mostrarDetallesDia(fechaActual));
        fila.appendChild(celda);

        if ((diaSemana + dia) % 7 === 0 || dia === ultimoDia.getDate()) {
            tablaCalendario.appendChild(fila);
            fila = document.createElement('tr');
        }
    }
}

// Navegación entre meses
document.getElementById('mes-anterior').addEventListener('click', () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    mostrarCalendario(fechaActual);
});

document.getElementById('mes-siguiente').addEventListener('click', () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    mostrarCalendario(fechaActual);
});

// Mostrar detalles de un día
function mostrarDetallesDia(fecha) {
    const eventos = cultivos.filter(c => c.fechaSiembra === fecha);
    alert(`Eventos para el ${fecha}:\n` + (eventos.length ? eventos.map(e => `${e.nombre}  Área: ${e.area}m²`).join('\n') : 'Sin eventos'));
}
