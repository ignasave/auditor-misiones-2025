const fs = require('fs');
const path = require('path');

// ✅ El validador que ya hicimos antes:
function validarSnapshot(snapshot) {
  const { partidos, resumen } = snapshot.data;

  let esValido = true;
  const log = [];

  // Validación 1: suma de votos de partidos == votos positivos
  const sumaPartidos = partidos.reduce((acc, p) => acc + p.votos, 0);
  const votosPositivos = resumen["VOTOS POSITIVOS"] || 0;

  if (sumaPartidos !== votosPositivos) {
    esValido = false;
    log.push(`❌ Suma partidos (${sumaPartidos}) ≠ VOTOS POSITIVOS (${votosPositivos})`);
  }

  // Validación 2: porcentaje coherente partido a partido
  partidos.forEach(p => {
    if (votosPositivos === 0) return;
    const porcentajeCalculado = (p.votos / votosPositivos) * 100;
    const diferencia = Math.abs(p.porcentaje - porcentajeCalculado);
    if (diferencia > 0.1) {
      esValido = false;
      log.push(`❌ Porcentaje partido ${p.partido}: Reportado ${p.porcentaje}% / Calculado ${porcentajeCalculado.toFixed(8)}% (Δ=${diferencia.toFixed(4)}%)`);
    }
  });

  // Validación 3: suma total general
  const blancos = resumen["VOTOS EN BLANCO"] || 0;
  const observados = resumen["VOTOS OBSERVADOS"] || 0;
  const impugnados = resumen["VOTOS DE IDENTIDAD IMPUGNADA"] || 0;
  const totalVotos = resumen["TOTAL DE VOTOS"] || 0;

  const sumaTotal = votosPositivos + blancos + observados + impugnados;

  if (sumaTotal !== totalVotos) {
    esValido = false;
    const diferenciaTotal = totalVotos - sumaTotal;
    log.push(`❌ Suma total (${sumaTotal}) ≠ TOTAL DE VOTOS (${totalVotos}) (Δ=${diferenciaTotal})`);
  }

  if (esValido) {
    log.unshift(`✅ [${snapshot.timestamp}] Consistente`);
  } else {
    log.unshift(`❌ [${snapshot.timestamp}] Inconsistencias detectadas`);
  }

  return { esValido, log };
}

// 🔎 Auditor histórico
function auditarHistorico() {
  const folder = path.join(__dirname, 'resultados');
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.json')).sort();

  let inconsistencias = 0;

  files.forEach(file => {
    const fullpath = path.join(folder, file);
    const snapshot = JSON.parse(fs.readFileSync(fullpath));
    const { esValido, log } = validarSnapshot(snapshot);
    log.forEach(line => console.log(line));
    if (!esValido) inconsistencias++;
  });

  console.log('\n-----');
  console.log(`Se procesaron ${files.length} snapshots`);
  console.log(`${inconsistencias} contienen inconsistencias`);
}

// Ejecutar auditoría completa
auditarHistorico();
