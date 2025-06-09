# 🗳️ Auditor Misiones 2025

Este proyecto realiza una auditoría automática en tiempo real sobre los resultados oficiales publicados por el sitio de las Elecciones Legislativas 2025 de la Provincia de Misiones (Argentina).

## Objetivo

Detectar inconsistencias internas en el sistema oficial de carga de datos:

- Chequeo de sumatoria de votos.
- Validación de porcentajes reportados.
- Consistencia interna entre categorías.
- Detección de anomalías de carga durante el escrutinio.

## ¿Qué hace el sistema?

- Se conecta cada 5 minutos a la web oficial de resultados.
- Automatiza la navegación (incluyendo selección de provincia).
- Extrae los datos crudos publicados.
- Guarda cada snapshot en formato JSON (con timestamp).
- Permite auditar la evolución de los resultados de forma histórica.

## ¿Qué valida?

En cada snapshot:

- Que los votos de los partidos sumen igual a los votos positivos.
- Que los porcentajes publicados coincidan con los votos informados.
- Que la suma de positivos + blancos + observados + impugnados coincida con el total de votos.
- Detecta diferencias abruptas en los datos históricos.

## Tecnologías utilizadas

- [Node.js](https://nodejs.org/)
- [Playwright](https://playwright.dev/) (automatización de scraping)
- Auditoría propia desarrollada en JavaScript.

## Instalación

1️⃣ Clonar el repo:

```bash
git clone https://github.com/tu-usuario/auditor-misiones-2025.git
cd auditor-misiones-2025
