# 📋 Checklist de Control - CoffeeTrack

Este checklist contiene los criterios de aceptación obligatorios que **todo el equipo** debe revisar meticulosamente en su entorno local **antes de realizar un commit** y, especialmente, **antes de aprobar o fusionar un Pull Request (PR)** hacia las ramas principales (`develop` o `main`). 

Mantener este estándar nos asegura institucionalizar la calidad del código, evitar que se rompa el sistema y garantizar la trazabilidad de todo el proyecto.

---

## 🔍 Criterios de Evaluación Obligatorios

* [ ] **Ausencia de conflictos:** Validar que la rama de la tarea no presente conflictos de líneas con la rama destino (`develop`). Si existen conflictos, deben resolverse de forma local mediante un `git merge develop` o `git rebase` antes de proceder.
* [ ] **Compilación exitosa:** Verificar que los cambios propuestos compilen y ejecuten al 100% correctamente tanto en el entorno local como dentro de los contenedores de desarrollo en Docker (`sqlserver_db` y `mongodb_nosql`). El servidor de Express debe levantar sin lanzar excepciones.
* [ ] **Validación del pipeline de CI:** Confirmar que el flujo automatizado de **GitHub Actions** haya finalizado todas sus tareas con un estado exitoso (el famoso **Check en verde** en la interfaz de GitHub).
* [ ] **Cumplimiento de convenciones:** Asegurar que los mensajes de todos los commits de la rama sigan estrictamente el formato estándar establecido (**RF-DO-04**): `tipo: descripción` (Por ejemplo: `feat: control de stock` o `fix: validación de imágenes`).
* [ ] **Pruebas y estabilidad:** Constatar que las nuevas funcionalidades cuenten con sus respectivas pruebas unitarias (o de integración) y, sobre todo, garantizar que no rompan la lógica existente del sistema ni corrompan los esquemas de la base de datos.
* [ ] **Descripción clara:** El Pull Request en GitHub debe documentar detalladamente el propósito del cambio realizado, las dependencias afectadas y los módulos del sistema que impacta directamente (Bebidas, Inventario, Pedidos, etc.).


