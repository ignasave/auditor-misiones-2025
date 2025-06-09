const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrapeResultados() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.elecciones2025.misiones.gov.ar/', { timeout: 60000 });

  await page.waitForSelector('.select__control', { timeout: 60000 });

  const selectorText = await page.innerText('.select__control');

  if (!selectorText.includes('MISIONES')) {
    await page.click('.select__control');
    await page.waitForTimeout(1000);
    await page.click('div.select__option:has-text("PROVINCIA DE MISIONES")');
    await page.waitForTimeout(3000);
  }

  const data = await page.evaluate(() => {
    const rows = document.querySelectorAll('.table__resultados tbody tr');
    const partidos = [];
    const resumen = {};

    rows.forEach(row => {
      const partidoCell = row.querySelector('td:nth-child(1)');
      const votosCell = row.querySelector('td:nth-child(2)');
      const porcentajeCell = row.querySelector('td:nth-child(3)');

      const nombre = partidoCell?.innerText.trim() || '';
      const votos = parseInt(votosCell?.innerText.replace(/\D/g, '')) || 0;
      const porcentaje = porcentajeCell?.innerText
        ? parseFloat(porcentajeCell.innerText.replace('%','').replace(',','.'))
        : null;

      if (nombre.startsWith("VOTOS") || nombre.startsWith("TOTAL")) {
        resumen[nombre] = votos;
      } else {
        partidos.push({
          partido: nombre,
          votos,
          porcentaje
        });
      }
    });

    const cards = Array.from(document.querySelectorAll('.card__info'));
    let porcentajeMesas = null;
    cards.forEach(card => {
      const header = card.querySelector('.card__info-header')?.innerText;
      if (header.includes('Porcentaje de Mesas Escrutadas')) {
        const raw = card.querySelector('.card__info-body')?.innerText || '';
        porcentajeMesas = parseFloat(raw.replace('%','').replace(',','.')) || null;
      }
    });

    return { partidos, resumen, porcentajeMesas };
  });

  const timestamp = new Date().toISOString();
  const filePath = path.join(__dirname, 'resultados', `${timestamp}.json`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify({ timestamp, data }, null, 2));

  console.log(`✅ [${timestamp}] Datos guardados en ${filePath}`);

  await browser.close();

  return { timestamp, data };
}

async function start() {
  try {
    const { timestamp, data } = await scrapeResultados();

    console.log(`🧮 Snapshot ${timestamp} capturado con éxito`);
    console.log(`🗳️ Total de votos: ${data.resumen["TOTAL DE VOTOS"] || 'N/A'}`);
    console.log(`📊 Porcentaje de mesas escrutadas: ${data.porcentajeMesas || 'N/A'}%`);
  } catch (err) {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] ERROR:`, err);
  }
}

start();
setInterval(start, 5 * 60 * 1000);
