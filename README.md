# Sistema de Monitoreo de Votación

Aplicación web desarrollada para registrar votos y visualizar estadísticas en tiempo real durante una elección municipal en la provincia de San Luis, Argentina.

El sistema fue diseñado para que fiscales distribuidos en distintas mesas puedan cargar datos directamente desde sus teléfonos móviles, permitiendo que el equipo de estadística visualice el avance del conteo en tiempo real.

## Demo
https://sistema-votos-nine.vercel.app/

⚠️ El sistema requiere autenticación para acceder a sus funcionalidades.
La demo pública permite visualizar únicamente la pantalla de inicio y el sistema de login.

## Tecnologías
- Next.js
- Tailwind CSS
- Firebase (Firestore/Auth)

## Funcionalidades
- Registro de votos por mesa
- Panel de carga de datos para fiscales o responsables
- Visualización de resultados en tiempo real
- Estadísticas y conteo acumulado
- Interfaz simple para uso rápido durante la jornada electoral
- Cada fiscal accedía a la aplicación desde su teléfono móvil.

## Sistema de acceso
La aplicación utilizó un sistema de autenticación para restringir el acceso únicamente a los participantes autorizados.
Se implementaron distintos niveles de usuario:

Administradores → gestión general del sistema.
Equipo de Estadística → visualización de resultados y métricas.
Fiscales → carga de datos de votación desde cada mesa.

Este sistema permitió mantener el control de acceso y organizar las funcionalidades según el rol de cada usuario.

## Objetivo del proyecto
El objetivo fue crear una herramienta rápida y confiable para centralizar el registro de votos informales y facilitar el análisis de resultados durante el proceso electoral.

## Deploy
- Hosting en Vercel
- Base de datos en Firebase

## Estado del proyecto
Este proyecto fue desarrollado para uso interno durante una elección municipal. Algunos detalles o configuraciones fueron omitidos en este repositorio.
