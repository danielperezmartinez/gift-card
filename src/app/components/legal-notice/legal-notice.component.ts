import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEGAL_OWNER } from '../../models/legal';

@Component({
  selector: 'app-legal-notice',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="legal">
      <a routerLink="/" class="back-link">← Volver</a>
      <h1>Aviso legal</h1>
      <p class="updated">Última actualización: {{ owner.updatedAt }}</p>

      <h2>Titular</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la
        información y de comercio electrónico (LSSI-CE), se informa de que esta aplicación web
        (<strong>Tarjetas regalo</strong>) es un proyecto personal y gratuito cuyo titular es
        <strong>{{ owner.name }}</strong>. Contacto:
        <a [href]="'mailto:' + owner.email">{{ owner.email }}</a>.
      </p>

      <h2>Objeto</h2>
      <p>
        La aplicación permite llevar el control del saldo de tarjetas regalo en tu propio
        dispositivo y, si lo decides, compartir una tarjeta mediante un enlace. No hay
        registro de usuarios, publicidad ni actividad comercial.
      </p>

      <h2>Condiciones de uso</h2>
      <p>
        El uso es libre y gratuito. Te comprometes a no utilizar la aplicación para fines
        ilícitos ni para introducir contenidos que vulneren derechos de terceros, y a no
        intentar acceder a datos ajenos ni sobrecargar el servicio.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        La aplicación es una herramienta de apoyo: el saldo real de una tarjeta es el que
        indique su emisor. El titular no se responsabiliza de las decisiones tomadas a partir
        de los datos introducidos ni de interrupciones del servicio, aunque procurará
        corregirlas lo antes posible. Quien conozca el enlace de una tarjeta compartida puede
        verla: compártelo solo con quien quieras.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        El diseño y el código de la aplicación pertenecen a su titular. Los datos que
        introduces son tuyos.
      </p>

      <h2>Privacidad</h2>
      <p>
        El tratamiento de datos se explica en la
        <a routerLink="/privacidad">política de privacidad</a>.
      </p>

      <h2>Legislación aplicable</h2>
      <p>Este aviso se rige por la legislación española.</p>
    </article>
  `,
  styleUrl: '../../legal.css',
})
export class LegalNoticeComponent {
  readonly owner = LEGAL_OWNER;
}
