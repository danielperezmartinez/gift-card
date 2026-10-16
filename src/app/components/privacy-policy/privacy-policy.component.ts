import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEGAL_OWNER } from '../../models/legal';

@Component({
  selector: 'app-privacy-policy',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="legal">
      <a routerLink="/" class="back-link">← Volver</a>
      <h1>Política de privacidad</h1>
      <p class="updated">Última actualización: {{ owner.updatedAt }}</p>

      <h2>Responsable</h2>
      <p>
        {{ owner.name }} — <a [href]="'mailto:' + owner.email">{{ owner.email }}</a>.
      </p>

      <h2>Qué datos se tratan y dónde</h2>
      <h3>En tu dispositivo</h3>
      <p>
        Las tarjetas que creas (nombre, descripción, importes, gastos y color), tu preferencia
        de tema claro u oscuro y, en las tarjetas que compartes, la clave de edición que te
        permite modificarlas se guardan en el almacenamiento local de tu navegador. No salen
        de tu dispositivo salvo que compartas una tarjeta. Puedes borrarlas eliminando las
        tarjetas o los datos del sitio en tu navegador. Cualquiera con acceso a tu navegador
        puede verlas, como el resto de datos que guarda.
      </p>

      <h3>Si compartes una tarjeta</h3>
      <p>
        Solo cuando pulsas «Compartir» se envían a nuestro proveedor de base de datos el
        nombre, la descripción, los importes, los gastos, el color y la fecha de creación de
        esa tarjeta, junto con un resumen cifrado (hash) de la clave de edición; la clave en
        sí no se envía nunca. Cualquiera que tenga el enlace puede ver la tarjeta. Evita
        incluir datos personales o códigos de canje en el nombre o la descripción.
      </p>
      <p>
        La copia compartida se conserva hasta que pulses «Dejar de compartir» o elimines la
        tarjeta desde el dispositivo que la compartió.
      </p>

      <h3>Datos técnicos</h3>
      <p>
        Al visitar la aplicación, el proveedor de alojamiento registra datos técnicos de la
        conexión (dirección IP, navegador, fecha y página) para servirla y protegerla frente a
        abusos. No se usan cookies, analítica ni publicidad, por lo que no se muestra un banner
        de cookies: el almacenamiento local es técnico y necesario para que la aplicación
        funcione.
      </p>

      <h2>Finalidad y base jurídica</h2>
      <ul>
        <li>
          Prestar el servicio que solicitas (guardar y, si lo pides, compartir tus tarjetas):
          ejecución del servicio solicitado (art. 6.1.b RGPD).
        </li>
        <li>
          Seguridad y funcionamiento del servicio mediante los datos técnicos: interés
          legítimo (art. 6.1.f RGPD).
        </li>
      </ul>

      <h2>Proveedores que reciben datos</h2>
      <ul>
        <li>
          <strong>Supabase</strong> (base de datos de las tarjetas compartidas). Los datos se
          alojan en la región de Fráncfort (Alemania, UE).
        </li>
        <li>
          <strong>Vercel Inc.</strong> (alojamiento web, Estados Unidos). Las transferencias
          internacionales se amparan en el Marco de Privacidad de Datos UE-EE. UU. y en
          cláusulas contractuales tipo.
        </li>
      </ul>
      <p>No se venden ni ceden datos a terceros.</p>

      <h2>Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación
        y portabilidad escribiendo a <a [href]="'mailto:' + owner.email">{{ owner.email }}</a>.
        Para localizar una tarjeta compartida indica su enlace. También puedes reclamar ante la
        Agencia Española de Protección de Datos (<a href="https://www.aepd.es">aepd.es</a>).
      </p>

      <p>Consulta también el <a routerLink="/aviso-legal">aviso legal</a>.</p>
    </article>
  `,
  styleUrl: '../../legal.css',
})
export class PrivacyPolicyComponent {
  readonly owner = LEGAL_OWNER;
}
