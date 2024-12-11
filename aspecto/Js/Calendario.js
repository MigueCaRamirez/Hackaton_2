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
    const duracionCiclo = document.getElementById('duracion-ciclo') ? document.getElementById('duracion-ciclo').value : 0; // Duración del ciclo (días)

    if (nombre && area > 0 && fechaSiembra && (duracionCiclo > 0 || duracionCiclo === 0)) {
        // Si hay duración de ciclo, calcular fecha de cosecha
        const fechaCosecha = duracionCiclo > 0 ? calcularFechaCosecha(fechaSiembra, duracionCiclo) : null;

        const nuevoCultivo = {
            nombre,
            area,
            fechaSiembra,
            duracionCiclo,
            fechaCosecha
        };

        cultivos.push(nuevoCultivo);
        localStorage.setItem('cultivos', JSON.stringify(cultivos));
        actualizarListaCultivos();
        formCultivos.reset();
    } else {
        alert('Por favor, completa todos los campos correctamente.');
    }
});

// Función para calcular la fecha de cosecha
function calcularFechaCosecha(fechaSiembra, duracionCiclo) {
    const fecha = new Date(fechaSiembra);
    fecha.setDate(fecha.getDate() + parseInt(duracionCiclo));
    return fecha.toISOString().split('T')[0]; // Devuelve la fecha en formato YYYY-MM-DD
}

// Actualizar la lista de cultivos
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

        // Nueva celda para la Fecha de Cosecha
        const celdaFechaCosecha = document.createElement('td');
        celdaFechaCosecha.textContent = cultivo.fechaCosecha ? cultivo.fechaCosecha : 'N/A'; // Mostrar "N/A" si no hay fecha de cosecha

        const celdaAcciones = document.createElement('td');
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.onclick = () => eliminarCultivo(index); // Función eliminar cultivo
        celdaAcciones.appendChild(botonEliminar);
        
        // Añadir las celdas a la fila
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaArea);
        fila.appendChild(celdaFechaSiembra);
        fila.appendChild(celdaFechaCosecha); // Añadir celda de fecha de cosecha
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
        const fechaDia = new Date(anio, mes, dia).toISOString().split('T')[0];

        // Resaltar la fecha de siembra
        if (cultivos.some(c => c.fechaSiembra === fechaDia)) {
            celda.classList.add('evento');
        }

        // Resaltar la fecha de cosecha
        if (cultivos.some(c => c.fechaCosecha === fechaDia)) {
            celda.classList.add('cosecha');
        }

        celda.addEventListener('click', () => mostrarDetallesDia(fechaDia));
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
    // Filtrar cultivos que tienen siembra o cosecha en la fecha seleccionada
    const eventosSiembra = cultivos.filter(c => c.fechaSiembra === fecha);
    const eventosCosecha = cultivos.filter(c => c.fechaCosecha === fecha);

    let mensaje = `Eventos para el ${fecha}:\n`;

    // Mostrar siembras
    if (eventosSiembra.length > 0) {
        mensaje += `Siembras:\n${eventosSiembra.map(e => `${e.nombre} - Área: ${e.area}m²`).join('\n')}\n`;
    }

    // Mostrar cosechas
    if (eventosCosecha.length > 0) {
        mensaje += `Cosechas:\n${eventosCosecha.map(e => `${e.nombre} - Área: ${e.area}m²`).join('\n')}\n`;
    }

    // Si no hay eventos
    if (eventosSiembra.length === 0 && eventosCosecha.length === 0) {
        mensaje += 'Sin eventos en esta fecha.\n';
    }

    alert(mensaje);
}
