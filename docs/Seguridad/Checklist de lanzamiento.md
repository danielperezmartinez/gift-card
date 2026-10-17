---
Nombre: Checklist de lanzamiento
Tipo: Checklist
Estado: Pendiente
Resumen: Estado de la configuración fuera del código (gasto, Auth, firewall, secretos, plan, GitHub y legal) que ningún test del repo comprueba. Aún sin revisar en los paneles.
Última revisión:
Última modificación: 2026-10-17T16:23:33+02:00
---

# Checklist de lanzamiento

Marca cada punto al revisarlo en el panel y anota el valor real. Al terminar,
`Estado: Revisada` y actualiza `Última revisión`. Se revisa antes de cada
lanzamiento relevante, al cambiar de plan y, como mínimo, una vez por trimestre.

Gift Card comparte proyecto de Supabase con nocendland y outify: conviene
revisar las tres checklists juntas.

## Supabase (devappsdpm-db · `zckqbrwdgxohdymiwbfz`)

- [ ] Plan actual y sus límites anotados (BD, Storage, egress, MAU). En el plan
      gratuito, superar un límite restringe **todo** el proyecto, no solo esta
      app. Apps que lo comparten: nocendland, outify, gift-card.
- [ ] Tope de gasto (Spend Cap) activado o, si se desactiva, decisión escrita.
- [ ] Alertas de uso o de facturación configuradas y con destinatario real.
- [ ] Auth: el registro abierto/cerrado es intencionado; solo están activos los
      proveedores que se usan; URLs de redirección limitadas a los dominios
      propios. (Gift Card no usa Auth; el ajuste lo deciden las otras apps.)
- [ ] Auth: confirmación de email, protección contra contraseñas filtradas,
      CAPTCHA y límites de envío de emails/OTP revisados.
- [ ] Auth: SMTP propio si se envían correos a usuarios reales.
- [ ] Esquemas expuestos por la API: solo los necesarios (`gift_card` expuesto
      para las RPC; lo gestiona nocendland en `pgrst.db_schemas`).
- [ ] `pg_net`/`http`: sin acceso para `anon` ni `authenticated` en el remoto.
- [ ] Copias de seguridad: lo que incluye el plan y si basta.

## Vercel (gift-card · `https://gift-card-bice.vercel.app`)

- [ ] Plan adecuado al uso (Hobby no admite uso comercial).
- [ ] Spend Management: tope y alertas configurados, y acción al superarlo.
- [ ] Firewall: reglas de límite de peticiones en rutas públicas.
- [ ] Deployment Protection en Preview si las previews no deben ser públicas.
- [ ] Variables secretas solo en los entornos que las usan y marcadas como
      sensibles (hoy la app solo usa la clave publicable).

## GitHub (danielperezmartinez/gift-card)

- [x] Visibilidad del repo (público o privado) conocida y coherente con las
      reglas de "Repositorio y publicación". Público (comprobado el 2026-10-17).
- [x] Secret scanning activado (2026-10-17).
- [x] Push protection activado (bloquea en el servidor los pushes con secretos
      conocidos) (2026-10-17).
- [x] Private vulnerability reporting activado, si el repo es público
      (2026-10-17).
- [x] Protección de `master` y ajustes del repo según
      [[README#Publicación]]: aplicados y releídos el 2026-10-17.
- [x] Hooks activos en cada clon de trabajo (`git config core.hooksPath`
      apunta a `.githooks`) y gitleaks instalado; fichero de patrones
      personales creado fuera del repo. Hecho en el clon principal el
      2026-10-17; repetir en cada clon nuevo (`pnpm install` lo activa).
- [x] Alertas de Dependabot activadas (2026-10-17).

## Legal y privacidad

- [x] Aviso legal y política de privacidad publicados y enlazados
      (`/aviso-legal`, `/privacidad`, pie de todas las páginas; 2026-10-17).
- [x] Terceros que reciben datos (Supabase, Vercel) listados en la política,
      con región de los datos (Supabase `eu-central-1`; Vercel, EE. UU.).
- [x] Banner de cookies solo si hay cookies no técnicas, y funciona sin cargar
      nada antes del consentimiento. No hay cookies ni almacenamiento no
      técnico: no hace falta banner.

## Accesibilidad

- [ ] Revisión manual con teclado y lector de pantalla de los flujos principales.
      Teclado revisado el 2026-10-17; lector de pantalla pendiente en
      [[Revisar la app con lector de pantalla]].

## Revisiones

| Fecha | Quién | Notas |
| --- | --- | --- |
