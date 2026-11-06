# Calculadora clásica — Flask + HTML/CSS/JS

Una calculadora clásica responsive con operaciones de suma, resta, multiplicación y división. Frontend en HTML/CSS/JS; backend Flask con API JSON y aritmética decimal. Lista para GitHub y Render.

## Estructura

```text
app.py                   # Backend Flask y API
requirements.txt         # Dependencias
render.yaml              # Despliegue automático en Render
templates/index.html     # Frontend
static/style.css         # Estilos
static/app.js            # Lógica de botones y teclado
tests/test_app.py        # Pruebas del backend
```

## Ejecutar localmente

Requiere Python 3.10 o posterior.

```bash
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Abre http://127.0.0.1:5000

## Pruebas

```bash
python -m unittest discover -s tests -v
```

## GitHub (VS Code Web)

1. Crea un repositorio nuevo en GitHub, por ejemplo `calculadora-clasica`.
2. **Descomprime el ZIP**. Sube los archivos y carpetas que contiene la carpeta `calculadora_clasica_render` a la **raíz del repositorio**, no el ZIP mismo.
3. Confirma con **Commit changes**. Si usas VS Code Web (`github.dev`), puedes editar esos archivos desde el navegador.

## Render

1. En Render, conecta tu cuenta GitHub.
2. Selecciona **New > Blueprint** y elige el repositorio. Render detectará `render.yaml`.
3. Confirma la creación del servicio (el plan `free` debe estar disponible en tu cuenta).
4. Render instalará las dependencias y arrancará Gunicorn automáticamente.
5. Accede a la URL pública `https://<nombre-del-servicio>.onrender.com` que Render te asigne.

Alternativa sin Blueprint: **New > Web Service**, runtime Python, Build Command `pip install -r requirements.txt`, Start Command `gunicorn --bind 0.0.0.0:$PORT app:app`.

## API

`POST /api/calculate` con JSON:

```json
{"a":"12.5","operator":"*","b":"2"}
```

Respuesta: `{"result":"25"}`. Se admiten operadores `+`, `-`, `*`, `/`. Errores de validación devuelven HTTP 400 y `{"error":"..."}`. `GET /health` devuelve estado del servicio.

## Notas

- El cálculo se ejecuta en el servidor, sin usar `eval`.
- No necesita base de datos, credenciales ni variables secretas.
- No incorpora historial persistente ni autenticación.
- En el plan gratuito de Render el servicio puede entrar en suspensión por inactividad.
