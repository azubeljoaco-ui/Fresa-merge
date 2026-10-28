# Fresa Studio

Simulador local de fusiones para Reels, con Matter.js, Canvas 2D y exportación offline mediante FFmpeg. No publica contenido ni usa servicios de pago.

## Descargar y ejecutar en Mac

Con Homebrew instalado, abre Terminal y ejecuta:

```sh
brew install node@24 ffmpeg
export PATH="$(brew --prefix node@24)/bin:$PATH"
git clone https://github.com/azubeljoaco-ui/Fresa-merge.git
cd Fresa-merge
npm ci
npm test
npm run dev
```

Mantén esa Terminal abierta y abre `http://127.0.0.1:3000` en Safari o Chrome. Para detener el servidor, pulsa Control+C. En una Terminal nueva vuelve a ejecutar la línea `export PATH=…` si Node 24 no está en tu PATH.

También puedes descargar **Code → Download ZIP** desde GitHub, descomprimirlo y abrir Terminal en la carpeta que contiene `package.json`; desde allí ejecuta `npm ci`, `npm test` y `npm run dev`. No ejecutes esos comandos desde la carpeta superior a la del proyecto.

Las dependencias incluyen binarios de Canvas para Mac con Apple Silicon e Intel. Las pruebas de este proyecto se ejecutaron en Linux; no se ha probado en una máquina macOS en esta sesión.

## Ejecutar

Requisitos: Node.js 22 o superior y FFmpeg con `libx264` y AAC (probado con Node 24.19.0).

```sh
npm ci
npm test
npm run dev
```

Abre el puerto local 3000 en tu navegador. El servidor escucha solo en loopback y no expone el estudio a Internet.

1. Importa la **imagen original** de siete fresas. Ajusta los seis cortes, el límite inferior y la tolerancia del fondo gris. Revisa todos los recortes sobre el tablero de transparencia antes de guardar. Alternativamente importa siete PNG transparentes nombrados `1.png` a `7.png`, en ese orden.
2. Pulsa reproducir. Puedes pausar, reiniciar, recorrer el tiempo, cambiar semilla, gravedad, rebote, intervalo y duración. Los cambios reinician la simulación. El audio de preview comienza silenciado; el MP4 siempre incluye los efectos.
3. Opcional: carga un WAV propio o con licencia para el “wow” femenino adulto. Se usan los primeros 1,5 segundos. No se incluye ni se imita una voz.
4. Pulsa **Exportar MP4**. El servidor genera todos los fotogramas, aunque tarde más que el video, y ofrece la descarga cuando termina. El audio se genera desde el registro de eventos, no desde el reloj de renderizado.

## Recursos originales pendientes

La imagen incrustada en el mensaje no está disponible como archivo de entrada en esta máquina. No se han incluido personajes sustitutos. Se necesita adjuntar la lámina original como PNG/JPG o aportar los siete recortes para completar la revisión de fidelidad y producir la primera muestra final. La interfaz bloquea reproducción y exportación cuando faltan recursos.

El importador usa eliminación de fondo gris por inundación desde los bordes. Conserva regiones interiores, pero puede afectar ropa gris que toque el fondo o dejar gris entre brazos y cuerpo. Es una ayuda de preparación, no una garantía de recorte perfecto. Para calidad final, usa PNG revisados a mano; los cortes ajustables permiten conservar accesorios y colas de vestidos. Todavía no se ha validado el recorte sobre la lámina original.

Los recursos se guardan en `public/assets/characters/1.png` … `7.png`; la voz, en `public/assets/audio/wow.wav`. Se ignoran en Git para no incorporar accidentalmente archivos subidos. Si quieres distribuirlos, revisa su licencia y agrégalos explícitamente. No se reutilizó el audio ni la marca de agua del video de referencia. Los efectos de monedas/caja son síntesis original del proyecto; revisa el permiso de uso de tus propios personajes y grabaciones.

## Exportar por terminal

```sh
npm run export
# O con un JSON propio:
npm run export -- config-ejemplo.json
```

Salida: `exports/fresa-merge.mp4` y `exports/fresa-merge.mp4.json`, con configuración, tiempos de fusión y momento de la forma final. H.264, AAC mono 48 kHz, 1080 × 1920, 30 fps, duración exacta configurada. No requiere navegador ni captura en tiempo real. Al cambiar parámetros no se garantiza llegar al nivel 7; la interfaz y el informe lo indican.

```json
{"seed":42,"gravity":1.05,"restitution":0.48,"interval":4.25,"duration":54}
```

El servidor permite una exportación a la vez. Evita modificar archivos de recursos desde terminal durante una exportación. El directorio `exports` contiene archivos locales generados y no se versiona.

## Estructura y mecánica

- `src/config.js`: parámetros, recipiente y secuencia editable de entradas.
- `src/simulation.js`: física a 120 Hz, cuerpos elípticos poligonales, rotación, reposo, paredes estáticas y fusiones una sola vez por cuerpo.
- `src/renderer.js`: composición 9:16, conducto, borde multicolor y partículas. La interfaz de edición nunca se dibuja en el video.
- `src/audio.js`: efectos originales y mezcla con limitador; la voz se carga aparte.
- `public/`: interfaz y preparación de recursos.
- `scripts/export.js`: renderizado Canvas en Node y codificación/multiplexado FFmpeg.
- `tests/simulation.test.js`: simulación completa, conservación, contactos simultáneos, determinismo, colisiones y sincronización de audio.

La receta `[1,1,2,3,4,5,1,1,2,3,4,5]` introduce niveles intermedios de forma explícita. Cada mitad suma 32 unidades y forma un nivel 6; dos niveles 6 forman el 7. No se alteran niveles ni se teletransportan personajes para forzar el final. Cuando aparece el 7 se detienen entradas y continúa la celebración. Con la configuración inicial se producen 11 fusiones y el nivel 7 llega a 48,225 s de 54 s. El intervalo efectivo se limita a `(duración - 5) / 11` si es necesario para dejar tiempo a la última caída.

## Validación

Se ejecutaron seis pruebas automatizadas; las cuatro semillas comprobadas llegan al nivel 7 cerca del final. Chromium validó la interfaz de escritorio y móvil, ausencia de errores JavaScript y bloqueo por recursos faltantes. La tubería de exportación se ejercitó con imágenes sintéticas temporales **solo para pruebas**, separadas de los recursos finales; estos videos no son muestras de las fresas solicitadas.

La validación visual de tus siete personajes, el “wow” real y el primer MP4 final quedan pendientes de sus archivos originales.
