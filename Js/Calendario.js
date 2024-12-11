// Variables globales
const ctx = document.getElementById('graficoResumen').getContext('2d');
let graficoResumen;

const cuerpoTablaCultivos = document.getElementById('cuerpo-tabla-cultivos');
const formCultivos = document.getElementById('form-cultivos');
const mesActual = document.getElementById('mes-actual');
const totalAreaElement = document.getElementById('total-area');
const areaSembradaElement = document.getElementById('area-sembrada');
const areaPorSembrarElement = document.getElementById('area-por-sembrar');
const fechaActual = new Date();

let cultivos = JSON.parse(localStorage.getItem('cultivos')) || [];

// Inicialización
actualizarTablaCultivos();
mostrarCalendario(fechaActual);
actualizarResumenAreas();

// Manejar envío del formulario
formCultivos.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre-cultivo').value;
    const area = document.getElementById('area').value;
    const fechaSiembra = document.getElementById('fecha-siembra').value;
    const duracionCiclo = document.getElementById('duracion-ciclo').value;

    if (nombre && area > 0 && fechaSiembra && duracionCiclo > 0) {
        const fechaCosecha = calcularFechaCosecha(fechaSiembra, duracionCiclo);

        const nuevoCultivo = {
            nombre,
            area,
            fechaSiembra,
            duracionCiclo,
            fechaCosecha
        };

        cultivos.push(nuevoCultivo);
        localStorage.setItem('cultivos', JSON.stringify(cultivos));
        actualizarTablaCultivos();
        actualizarResumenAreas();
        formCultivos.reset();
    } else {
        alert('Por favor, completa todos los campos correctamente.');
    }
});

// Calcular la fecha de cosecha
function calcularFechaCosecha(fechaSiembra, duracionCiclo) {
    const fecha = new Date(fechaSiembra);
    fecha.setDate(fecha.getDate() + parseInt(duracionCiclo));
    return fecha.toISOString().split('T')[0];
}

// Actualizar la tabla de cultivos
function actualizarTablaCultivos() {
    cuerpoTablaCultivos.innerHTML = '';
    cultivos.forEach((cultivo, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${cultivo.nombre}</td>
            <td>${cultivo.area} m²</td>
            <td>${cultivo.fechaSiembra}</td>
            <td>${cultivo.fechaCosecha}</td>
            <td><button onclick="eliminarCultivo(${index})">Eliminar</button></td>
        `;
        cuerpoTablaCultivos.appendChild(fila);
    });
}

// Eliminar cultivo
function eliminarCultivo(index) {
    cultivos.splice(index, 1);
    localStorage.setItem('cultivos', JSON.stringify(cultivos));
    actualizarTablaCultivos();
    actualizarResumenAreas();
}

// Actualizar resumen de áreas
function actualizarResumenAreas() {
    let totalArea = 0;
    let areaSembrada = 0;

    cultivos.forEach(cultivo => {
        totalArea += parseFloat(cultivo.area);
        if (new Date(cultivo.fechaSiembra) <= fechaActual) {
            areaSembrada += parseFloat(cultivo.area);
        }
    });

    const areaPorSembrar = totalArea - areaSembrada;

    totalAreaElement.textContent = totalArea.toFixed(2);
    areaSembradaElement.textContent = areaSembrada.toFixed(2);
    areaPorSembrarElement.textContent = areaPorSembrar.toFixed(2);

    if (graficoResumen) {
        graficoResumen.destroy();
    }

    graficoResumen = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Área', 'Área Sembrada', 'Área por Sembrar'],
            datasets: [{
                label: 'Áreas en m²',
                data: [totalArea, areaSembrada, areaPorSembrar],
                backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                borderColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Mostrar calendario
function mostrarCalendario(fecha) {
    const diasCalendario = document.getElementById('dias-calendario');
    diasCalendario.innerHTML = '';

    const mes = fecha.getMonth();
    const year = fecha.getFullYear();

    const primerDia = new Date(year, mes, 1).getDay();
    const ultimoDia = new Date(year, mes + 1, 0).getDate();

    mesActual.textContent = `${fecha.toLocaleString('es-ES', { month: 'long' })} ${year}`;

    let dia = 1;
    for (let i = 0; i < 6; i++) {
        const fila = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const celda = document.createElement('td');
            if (i === 0 && j < primerDia || dia > ultimoDia) {
                celda.textContent = '';
            } else {
                celda.textContent = dia;
                dia++;
            }
            fila.appendChild(celda);
        }
        diasCalendario.appendChild(fila);
    }
}

// Navegación por meses
const botonMesAnterior = document.getElementById('mes-anterior');
const botonMesSiguiente = document.getElementById('mes-siguiente');

botonMesAnterior.addEventListener('click', () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    mostrarCalendario(fechaActual);
});

botonMesSiguiente.addEventListener('click', () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    mostrarCalendario(fechaActual);
});

// Exportar datos a CSV
function exportarCSV() {
    let csvContent = 'Nombre,Área (m²),Fecha de Siembra,Fecha de Cosecha\n';
    cultivos.forEach(cultivo => {
        csvContent += `${cultivo.nombre},${cultivo.area},${cultivo.fechaSiembra},${cultivo.fechaCosecha}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cultivos.csv');
    link.click();
}

// Exportar datos a PDF
function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text('Cultivos', 10, 10);
    let y = 20;

    cultivos.forEach(cultivo => {
        doc.text(`Nombre: ${cultivo.nombre}, Área: ${cultivo.area} m², Fecha Siembra: ${cultivo.fechaSiembra}, Fecha Cosecha: ${cultivo.fechaCosecha}`, 10, y);
        y += 10;
    });

    doc.save('cultivos.pdf');
}
