import React from 'react';
import { Dialog, DialogContent, makeStyles } from '@material-ui/core';

import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';

const useStyles = makeStyles(() => ({
	dialog: {
		backgroundColor: '#0D1021',
		color: '#FFF'
	}
}));

const QaplaTerms = ({ open, onClose }) => {
	const classes = useStyles();

    return (
        <Dialog fullScreen
			open={open}
			onClose={onClose}
			classes={{ paper: classes.dialog }}>
            <DialogContent style={{ paddingRight: 48, paddingLeft: 48 }}>
			<div style={{ position: 'absolute', top: '24px', right: '24px', cursor: 'pointer' }}>
				<CloseIcon onClick={onClose} className={classes.closeButton} />
			</div>
			<h1 style={{ textAlign: 'center' }}>
				Términos y Condiciones de Uso <br /> para los Creadores de <br /> Contenido dentro de Qapla
			</h1>
			<br />
			<br />
            Los siguientes términos y condiciones de uso, constituyen el contenido del Contrato que regula la relación entre Qapla Gaming (en lo sucesivo “Qapla”) Y <b>USTED</b> denominado para los efectos del presente Contrato como Creador de Contenido o Streamer (de manera indistinta) y le serán aplicables por el simple hecho de darse de alta y crear una cuenta dentro de los servicios, plataformas o productos de <b>“QAPLA”</b> a través de cualquiera de los medios presente y futuros disponibles, por lo que su aceptación (cualquiera que sea la forma en que se realice) en someterse a estos Términos y Condiciones de uso, será una manifestación expresa de su aceptación por voluntad propia, plena y sin reservas.
			<br />
			<br />
			Si el <b>Creador de Contenido</b> no está de acuerdo con cualquiera de los Términos y Condiciones de uso, notificaciones legales y la Política de Privacidad, deberá dejar de utilizar cualquiera de nuestros servicios y productos. El continuar utilizándolos será razón suficiente para asumir que Usted está de acuerdo en su totalidad con dichos Términos y Condiciones.
<br />
<br />
<h2>
1.- Del uso de la marca.
</h2>

<b>1.1.-</b> Cualquier uso, reproducción, modificación o distribución de <b>Qapla</b> sin la autorización expresa de acuerdo con los términos del presente contrato queda expresamente prohibida y será motivo suficiente para iniciar las acciones legales correspondientes contra quienes resulten responsables conforme la jurisdicción que sea elegida por <b>Qapla</b>.
<br />
<br />

<h2>2.- Experiencia y finalidad de <b>Qapla</b>. (Glosario)</h2>
<b>2.1.- Qapla</b>:  Es una herramienta digital de interacción entre la Comunidad y Creadores de Contenido, dedicada preponderantemente para el área de videojuegos y live streaming.
<br />
<br />
<b>2.2.- De los videojuegos en general:</b> Son aquellos en el que una o más personas interactúan, por medio de un controlador, con un dispositivo que muestra imágenes de vídeo. Este dispositivo electrónico, conocido genéricamente como «plataforma», puede ser una computadora, una máquina arcade, una videoconsola o un dispositivo portátil (un teléfono móvil, por ejemplo). <b>Qapla</b> entiende a los videojuegos como medios de arte, competencia y deporte.
<br />
<br />
<b>2.3.- Del Live Streaming en general: Qapla</b> entiende el <b>Live Streaming</b> como un video que se envía de manera online, con un formato comprimido, pero este llega en tiempo real para los usuarios en general.
<br />
<br />
Para que el <b>Live Streaming</b> se pueda llevar a cabo, es necesario contar con un medio que capture el contenido, codificándolo al publicarlo y hacer la transmisión en vivo. Además, es necesaria una red de distribución para que los espectadores puedan ver la transmisión, <u><b>misma que debe ser proporcionada por los Creadores de Contenido (Streamers) y que es ajena a Qapla.</b></u>
<br />
<br />
<b>2.4.- De la función de Qapla: Qapla</b> únicamente será arbitro, intermediario y administrador dentro de los servicios descritos más adelante, <u><b>ya que toda la interacción entre la Comunidad y Creadores de Contenido es ajena a Qapla sin que esta misma pueda tener una intervención mayor.</b></u>
<br />
<br />
<b>2.5.- De los Creadores de Contenido (Streamers):</b> Los Creadores de Contenido en lo subsecuente y sólo para fines representativos denominados “Qreadores de Qontenido”, son todas aquellas personas que se han unido de manera voluntaria a los servicios que ofrece <b>Qapla</b> para consigo y sus usuarios, mismos que generan y crean su propio contenido y del cual <b>Qapla</b> es totalmente ajeno. Los Qreadores de Qontenido desde el momento que utilizan los servicios proporcionados por <b>Qapla</b> aceptan y reconocen que no forman parte directa de <b>Qapla</b> y que únicamente buscan el uso de la aplicación como una herramienta de interacción para desarrollar y expandir su comunidad.
<br />
<br />
<b>2.6.- De los Cheers.-</b> Son las donaciones de Qoins que realiza la Comunidad a los Qreadores de Qontenido.
<br />
<br />
<b>2.7.- Qlan.-</b> Grupo de usuarios de la Comunidad que se unen de manera particular con un <b>Qreador de Qontenido</b> para trabajar y desempeñarse como equipo dentro de la plataforma <b>Qapla</b> y así conseguir recompensas y beneficios de manera grupal.
<br />
<br />

<b>2.8.- Qódigo de Qreador.-</b> Es un código por medio del cual los Qreadores de Qontenido pueden compartir distintas funciones dentro de la aplicación.
<br />
<br />

<b>2.9.- Comunidad.-</b> Son todas las personas que interactúan de manera directa o indirecta a través de la plataforma <b>Qapla</b>, en lo subsecuente y sólo para fines representativos denominada <b>“Qomunidad”</b>.
<br />
<br />

<b>2.10.- Qapla Boost.-</b> Es una mejora a cualquiera de los servicios ofrecidos dentro de <b>Qapla</b>.
<br />
<br />

<h2>3.- De las cuentas.</h2>

<b>3.1.-</b> <b>Qapla</b> no reconoce las transferencias de Cuentas y/o de cualquier otro tipo no autorizada de su software, lo que conllevará la eliminación definitiva de la Cuenta del <b>Qreador de Qontenido</b>.
<br />
<br />

<b>3.2.-</b> El <b>Qreador de Qontenido</b> no podrá poner a la venta o comerciar con ninguna Cuenta, resultando en una violación al presente contrato y puede conllevar a la suspensión o cancelación de la Cuenta. Todas las cuentas son de carácter personal e intransferibles.
<br />
<br />

<b>3.3.- En los casos de periodo de inactividad por parte del <b>Qreador de Qontenido</b> y cancelación de la cuenta:</b>
	<ol type='a'>
		<li>
			En caso de que el <b>Qreador de Qontenido</b> presente un periodo de inactividad por más de 12 meses dentro de las plataformas o productos de <b>Qapla</b>, todos los elementos contenidos dentro de la cuenta prescribirán y se dejaran sin efectos y valor alguno, por lo que el <b>Qreador de Qontenido</b> acepta dicha condición desde el momento que crea su cuenta y accede a los servicios y productos de <b>Qapla</b>.
		</li>
		<li>
			En caso de la cancelación definitiva de la cuenta del <b>Qreador de Qontenido</b> por cualquier causa, este último reconoce y acepta que todos los elementos y productos contenidos en su cuenta desaparecerán en conjunto con la misma en el momento inmediato de su cancelación.
		</li>
	</ol>
<br />

<b>3.4.-</b> El <b>Qreador de Qontenido</b> se compromete a no:

	<ol type='I'>
		<li>
			Modificar o causar la modificación de cualquier fichero o historial de cuenta que forme parte de la instalación de <b>Qapla</b>;
		</li>
		<li>
			Crear o utilizar trampas y/o sabotajes, o cualquier programa de un tercero diseñado para alterar el funcionamiento de <b>Qapla</b> y cualquier elemento relacionado con el mismo;
		</li>
		<li>
			Usar programas de terceros que intercepten, extraigan o de cualquier otra forma que recopilen información procedente o a través de <b>Qapla</b>;
		</li>
		<li>
			Vulnerar deliberadamente cualquier ley local, estatal, nacional o internacional o reglamento aplicable al uso de <b>Qapla</b> o del Servicio;
		</li>
		<li>
			No podrá iniciar, cooperar o participar en un ataque contra el servidor de <b>Qapla</b> o tratar de otro modo de interrumpir el funcionamiento de los servidores de <b>Qapla</b>;
		</li>
		<li>
			No podrá comenzar ataque alguno que suponga un perjuicio para el suministro de servicios de <b>Qapla</b> para otros Creadores o Usuarios; y
		</li>
		<li>
			Cualquier otra acción que sea en detrimento y perjuicio de <b>Qapla</b>, a simple discreción de este último, por cualquier medio o forma.
		</li>
	</ol>
<br />

<b>3.5.-</b> El <b>Qreador de Qontenido</b> sólo podrá crear una cuenta personal, quedando prohibido la creación de varias cuentas por una sola persona, es decir, sólo se podrá solicitar acceso al sistema por 1 persona a la vez.
<br />
<br />
<b>Qapla</b> se reserva el derecho de aplicar cualquier sanción que estime conveniente, inclusive la cancelación y/o bloqueo (baneo) temporal o permanente de los <b>Qreador de Qontenido</b> que infrinjan dicha regla.
<br />
<br />
<b>
CUALQUIER INTENTO POR PARTE DE UN CREADOR QUE UTILICE UNA CUENTA PARA DAÑAR QAPLA O MENOSCABAR EL FUNCIONAMIENTO NORMAL DEL MISMO, CONSTITUYE UNA INFRACCIÓN DE LA LEGISLACIÓN PENAL Y CIVIL. EN ESTOS CASOS, QAPLA SE RESERVA EL DERECHO A RESARCIRSE DE LOS DAÑOS CAUSADOS POR DICHO QREADOR DE QONTENIDO HASTA LA CUANTÍA MÁXIMA PERMITIDA POR LA LEY.
</b>
<br />
<br />

<h2>
4.- Normas de Conducta de <b>Qapla</b>.
</h2>

<b>4.1.-</b> Como todas las cosas, <b>Qapla</b> se rige por ciertas Normas de Conducta que el <b>Qreador de Qontenido</b> debe observar.
<br />
<br />
El <b>Qreador de Qontenido</b> tiene la obligación de conocer, comprender y cumplir dichas Normas de Conducta. Las siguientes normas no tienen carácter exhaustivo, por lo que <b>Qapla</b> se reserva el derecho a determinar qué conducta se considera contraria al servicio proporcionado y a emprender medidas disciplinarias.
<br />
<br />
<b>4.2.-</b> Cuando utilice el Chat, foros o en general cualquier medio de comunicación de <b>Qapla</b>, el <b>Qreador de Qontenido</b> no podrá:

	<ol type='I'>
		<li>Transmitir o publicar contenido o utilizar lenguaje, escrito o verbal, que <b>Qapla</b>, a su sola discreción, considere ofensivo, ilegal, perjudicial, amenazante, insultante, acosador, difamatorio, vulgar, obsceno, que incite al odio, sexualmente explícito o que sea racial o éticamente reprobable. Asimismo, no podrá utilizar una ortografía incorrecta o alternativa para burlar las restricciones citadas anteriormente;</li>

		<li>Llevar a cabo cualquier acción susceptible de causar un mal funcionamiento, inclusive mal informar a su comunidad o intentar generar perjuicios o difamaciones respecto de otros Creadores;</li>

		<li>Comunicar o publicar información personal de cualquier Creador en <b>Qapla</b> y sus diversos medios de difusión o en sitios web o foros relacionados con este último. No obstante, los Creadores que utilicen <b>Qapla</b> podrán comunicar información personal que ellos consideren;</li>

		<li>Utilizar componentes u otras técnicas automatizadas para recopilar información de <b>Qapla</b>;</li>

		<li>Acosar, amenazar, molestar, avergonzar, o provocar malestar o incomodar a cualquier miembro de la comunidad de <b>Qapla</b> o a los representantes de <b>Qapla</b>;</li>

		<li>Hacer trampas o utilizar fallos de programación de <b>Qapla</b>; y</li>

		<li>Cualquier otra que sea determinada a discreción de <b>Qapla</b> y que infrinjan directa o indirectamente lo establecido en el presente contrato.</li>
	</ol>
<br />
<b>4.3.-</b> <b>Qapla</b> podrá, a su entera discreción, adoptar cuantas medidas estime necesarias para preservar la integridad de la empresa. La infracción de cualquiera de las Normas de Conducta podrá derivar en la adopción de medidas por parte de <b>Qapla</b>, con efecto inmediato o en el momento que esta última determine.
<br />
<br />
Dichas medidas podrán consistir, a modo de ejemplo, en:

	<ol type='a'>
		<li>La suspensión temporal del <b>Qreador de Qontenido</b> a <b>Qapla</b>; y</li>
		<li>La cancelación definitiva de su acceso a <b>Qapla</b>.</li>
	</ol>
<br />
<h2>
5.- Servicios para los Qreadores de Qontenido de <b>Qapla</b>.
</h2>

<b>5.1.-</b> Los servicios que se ofertan dentro de <b>Qapla</b> al <b>Qreador de Qontenido</b> son:

	<ol type='a'>
		<li>Recibir Cheers de Qoins de la <b>Qomunidad</b>.</li>
		<li>Creación del perfil universal para el <b>Qreador de Qontenido</b> dentro de <b>Qapla</b>, el cual unirá diversos enlaces y sitios web de terceros; y</li>
		<li>Herramientas de interacción entre el <b>Qreador de Qontenido</b> y la <b>Qomunidad</b>.</li>
	</ol>
<br />
<h2>
6.- Sobre los Qoins, eventos en general, puntos del canal y las recompensas.
</h2>

<b>6.1.- Qoins</b>: Es la moneda virtual que utilizamos dentro de <b>Qapla</b>, la cual sirve para realizar cualquier tipo de transacción dentro de la plataforma, por ejemplo, recibir cheers por parte de la <b>Qomunidad</b> a los <b>Qreador de Qontenido</b>.
<br />
<br />
<b>Qapla</b> se reserva el derecho para establecer y realizar las dinámicas que considere pertinentes para la adquisición de los Qoins y la forma de ejercer y aplicar los mismos para la adquisición de productos.
<br />
<br />

<b>6.2.- Eventos en general:</b> Organización de acontecimientos por parte de <b>Qapla</b> o de los Qreadores de Qontenido tendientes a la celebración de actividades que propicien el desarrollo y generación de comunidad en todos sus ámbitos, principalmente en el sector gamer.
<br />
<br />

<b>6.3.- Recompensas:</b> Son los beneficios que <b>Qapla</b> o el <b>Qreador de Qontenido</b> retribuyen o reciben de la Comunidad al cumplir con ciertas condiciones y/o requisitos de manera general y particular. Las condiciones y/o requisitos pueden ser cumplidos de manera individual o colectiva por parte de la <b>Qomunidad</b> de <b>Qapla</b>.
<br />
<br />

<b>6.4.- De los productos en general:</b> La entrega de los productos se hará por medio del servidor de recompensas denominado Discord®.
<br />
<br />
<b>Qapla</b> no se hace responsable por su falta de cobro o por cualquier otra causa imputable al proveedor.
<br />
<br />
<b>6.5.- Puntos del Canal:</b> Son un programa de puntos personalizables dentro de la plataforma Twitch® que permite a los Qreadores de Qontenido recompensar a los miembros de la <b>Qomunidad</b> con ciertas ventajas.
<br />
<br />

<b>6.6.- Experiencia Qapla (XQ):</b> Son puntos de experiencia que los Usuarios del  <b>Qreador de Qontenido</b> obtiene por participar en diferentes dinámicas y/o eventos dentro de <b>Qapla</b>.
<br />
<br />

<h2>
7.- DE LOS QOINS EN GENERAL.
</h2>

Los Qreadores de Qontenido podrán adquirir Bits de Twitch® a través de Qoins de <b>Qapla</b>.
<br />
<br />
<b>7.1.-</b> El <b>Qreador de Qontenido</b> podrá a través de <b>Qapla</b> adquirir Qoins de las siguientes formas:

	<ol type='a'>
		<li>A través de cheers por parte de la <b>Qomunidad</b>;</li>
		<li>Derivado del canje de Qoins de los usuarios pertenecientes al Qlan de cada Creador de Contenido, estos recibirán 5 Qoins cada vez que un integrante de su Qlan realice un canje de Qoins dentro de la plataforma; y</li>
		<li>A través de eventos organizados por <b>Qapla</b>.</li>
	</ol>
<br />
<b>7.2.- De las reglas en general para recibir Qoins.-</b> El <b>Qreador de Qontenido</b> para poder acceder y reclamar sus Qoins derivados de las formas expuestas en el punto anterior, deberá tener registrada una cuenta en <b>Qapla</b>.
<br />
<br />

<b>7.3.- Sobre el retiro de Qoins:</b> Por medio de la Plataforma Discord® en el servidor de Streamers de <b>Qapla</b>, se deberá solicitar el canje de sus Qoins por Bits que corresponderá a 5 bits por cada 200 Qoins. Se requiere lo equivalente a un mínimo de 250 Bits para realizar el retiro.
<br />
<br />


<h2>
8.- De las obligaciones de las partes en general.
</h2>

<b>8.1.-</b> <b>Qapla</b> se reserva la facultad de cobro por mantenimiento y uso del servicio de cualquiera de los productos ofertados al <b>Qreador de Qontenido</b> por lo que este último acepta íntegramente dicho cobro previo aviso correspondiente.
<br />
<br />

<b>8.2.-</b> El <b>Qreador de Qontenido</b> reconoce y acepta que su cuenta no es una cuenta bancaria y por lo tanto no está asegurada, garantizada, patrocinada o protegida de otra manera por ningún sistema de seguros de depósitos o bancario o por cualquier otro sistema similar de seguros de cualquier otra jurisdicción, incluyendo a su jurisdicción local.
<br />
<br />

<b>8.3.-</b> <b>Qapla</b> tendrá el derecho a determinar si los productos que ha solicitado que se acrediten a su cuenta están disponibles.
<br />
<br />

<b>8.4.-</b> Cualquier adquisición de productos que se encuentren disponibles en la plataforma de <b>Qapla</b>, serán tratados por nosotros como una autorización para descontar a la cuenta del <b>Qreador de Qontenido</b> el saldo correspondiente siempre y cuando tenga el suficiente.
<br />
<br />

<b>8.5.-</b> Así como cualquier otro proceso de verificación podemos solicitar a cualquier titular de la cuenta a presentar pruebas adicionales de su identidad para ayudar en la verificación de la personalidad del <b>Qreador de Qontenido</b>.
<br />
<br />

<h2>
9.- Sobre el uso de servicio y control parental.
</h2>

<b>9.1.-</b> El uso del servicio será exclusivamente para mayores de 18 años o en su caso para edades menores, previa autorización y supervisión de sus padres o tutores. <b>Qapla</b> no se hace responsable por el mal uso del servicio por algún menor, o por realizar ingresos sin vigilancia y autorización de sus padres o tutores. <b>Qapla</b> asume en todo momento, que los <b>Qreador de Qontenido</b> son mayores de edad o cuentan con previa autorización de las personas responsables de los menores.
<br />
<br />

<h2>
10.- Administración de <b>Qapla</b> (Cambios en los Términos y Condiciones de Uso).
</h2>

<b>10.1.-</b> <b>Qapla</b> podrá, de manera temporal o definitiva, cambiar o modificar estas Condiciones de Uso. En tal caso, <b>Qapla</b> le informará sobre tales cambios o modificaciones con una notificación especial a los <b>Qreadores de Qontenido</b>.
<br />
<br />

<b>10.2.-</b> Si no se opone a los cambios de los presentes Términos y Condiciones de Uso de manera inmediata tras la notificación correspondiente, el uso continuado de <b>Qapla</b> y todos sus productos significará su aceptación de las Condiciones de Uso modificadas.
<br />
<br />

<b>10.3.-</b> Con la notificación, <b>Qapla</b> le recuerda al <b>Qreador de Qontenido</b> que su uso continuado tras la notificación significará que acepta todos los cambios realizados.
<br />
<br />

<h2>
11.- Titularidad de los derechos.
</h2>

<b>11.1.-</b> Todos los derechos de propiedad intelectual relativos a <b>Qapla</b> incluyendo las cuentas de Qreadores de Qontenido, los títulos, los códigos de ordenador, y todos los demás elementos utilizados y creados por <b>Qapla</b> son titularidad íntegra de este último.
<br />
<br />

<b>11.2.-</b> <b>Qapla</b> se encuentra protegido por la legislación de derechos de autor de los Estados Unidos Mexicanos, por los tratados y convenios internacionales sobre derechos de autor y por todas las demás leyes aplicables. Quedan reservados todos los derechos.
<br />
<br />

<b>11.3.-</b> <b>Qapla</b> puede contener ciertos materiales sujetos a licencia, en cuyo caso los licenciadores podrán hacer valer sus derechos en el supuesto de cualquier violación de este Contrato.
<br />
<br />
La licencia limitada para el uso del Servicio, con sujeción a su acuerdo y a su cumplimiento <b>Qapla</b> le otorga, y usted acepta una licencia limitada, revocable, no transferible, no sublicenciable y no exclusiva para usar el Servicio solamente para sus propósitos de entretenimiento y como herramienta para los Qreadores de Qontenido. No puede utilizar el Servicio para ningún otro propósito que no sea autorizado por parte de <b>Qapla</b>.
<br />
<br />
<h2>
12.- Otorgamiento de consentimiento.
</h2>

<b>12.1.-</b> El <b>Qreador de Qontenido</b> reconoce que:
	<ol type='a'>
		<li>Asume el coste de acceso telefónico y a Internet, así como los derivados del equipo necesario para mantener la conexión a los servidores de <b>Qapla</b>, su revisión, reparación y corrección.</li>

		<li><b>QAPLA NO GARANTIZA QUE SUS SERVIDORES PERMANECERÁN ININTERRUMPIDOS O SIN FALLOS O EL SERVICIO NO SE VERÁ AFECTADO POR VIRUS O POR OTROS COMPONENTES DAÑOSOS.</b></li>

		<li><b>Qapla</b> le advierte expresamente que no es posible desarrollar productos de ordenador complejos que se encuentren totalmente exentos de defectos técnicos. Las características contractualmente establecidas del programa y del servicio a prestar por <b>Qapla</b> no exigen que el programa esté completamente libre de errores de programación sino, simplemente, que el programa esté exento de errores de programación que perjudiquen sustancialmente su uso.</li>

		<li>Es posible que usted no pueda acceder a la plataforma de <b>Qapla</b> siempre que lo desee y puede que existan largos períodos durante los que no pueda acceder al mismo.</li>
	</ol>
<br />

<h2>
13.- Aceptación del uso del servicio.
</h2>

<b>13.1.-</b> Los Términos y Condiciones, junto con la Política de Privacidad, así como cualquier otro acuerdo o documento incorporado expresamente por parte de <b>Qapla</b>, constituyen la totalidad y exclusivo entendimiento y acuerdo entre usted y <b>Qapla</b> con respecto a su uso y el acceso al Servicio, y salvo lo expresamente permitido.
<br />
<br />
<u><b>El hecho de no exigir el cumplimiento de cualquier disposición no afectará a nuestro derecho a exigir el cumplimiento en cualquier momento posterior, ni una renuncia a cualquier violación o incumplimiento de los Términos y Condiciones de Uso, lo cual inclusive constituirá una renuncia de cualquier incumplimiento posterior o por defecto o una renuncia a la propia disposición. El uso de encabezados de párrafo en los Términos es sólo para conveniencia y no tendrá ningún impacto en la interpretación de las disposiciones particulares. En el caso de que alguna parte de los Términos y Condiciones de Uso se considera inválida o inaplicable, la parte no ejecutable se da efecto en la mayor medida posible y las partes restantes permanecerán en pleno vigor y efecto. A la terminación de los Términos y Condiciones de Uso, cualquier disposición que, por su naturaleza o condiciones expresas deben sobrevivir, sobrevivirá dicha terminación o expiración.</b></u>
<br />
<br />
<h2>
14.- Información de contacto.
</h2>
<b>14.1-</b> Si usted tiene alguna pregunta con respecto a la plataforma de <b>Qapla</b>, el Servicio o los Términos y Condiciones de Uso por favor contáctenos en: <a href="mailto:soporte@qapla.gg">soporte@qapla.gg</a>
<br />
<br />

<h2>
15.- Enlaces de Terceros.
</h2>

<b>15.1.-</b> Los sitios enlazados pueden permitirle al <b>Qreador de Qontenido</b> abandonar el sitio web o app de <b>Qapla</b>, cuya finalidad es facilitar a los Qreadores de Qontenido la búsqueda de y/o acceso en internet de ciertos contenidos, productos o servicios de terceros; lo anterior, no presupone, ni se establece explícitamente, la existencia de alguna clase de vínculo, comisión, agencia, distribución, comercialización, responsabilidad, obligación o asociación entre <b>Qapla</b> y los operadores, sociedades, individuos y/o cualquier tercero, de los sitios enlazados y/o los terceros propietarios de dichos sitios.
<br />
<br />

<b>15.2.-</b> <b>Qapla</b> no se hace responsable de examinar, evaluar el contenido o exactitud del mismo, por lo que no tiene ningún tipo de responsabilidad por cualquier material de terceros o sitios web ajenos, o por cualquier productos o servicios de terceros.
<br />
<br />

<b>15.3.-</b> <b>Qapla</b> no garantiza ni asume responsabilidad alguna por los daños y/o perjuicios de toda clase que puedan causarse por el funcionamiento, disponibilidad, accesibilidad o continuidad de los sitios enlazados ni cualquier otra deficiencia presentada por dichos enlaces.
<br />
<br />
El <b>Qreador de Qontenido</b> reconoce y acepta que <b>Qapla</b> queda excluida de cualquier responsabilidad que pudiera ser causada por el uso no autorizado de las marcas u otros derechos de propiedad intelectual, industrial y/o derechos de autor de terceros o contenidos en los Sitios Enlazados.
<br />
<br />

<h2>
16.- DE LA <b>QOMUNIDAD</b> GAMER, DE LOS QREADORES DE QONTENIDO y LA INTERACCIÓN POR PARTE DE LOS CREADORES DE QAPLA.
</h2>

<b>16.1.-</b> La <b>Qomunidad</b> Gamer y de los Qreadores de Qontenido representa a toda aquella persona que juega de manera recurrente a videojuegos o bien Qreadores de Qontenido que son retransmitidos por diversas plataformas, por lo que el <b>Qreador de Qontenido</b> acepta y otorga su pleno reconocimiento y aceptación de que dicha comunidad no son parte de <b>Qapla</b>, por lo que la empresa no se hace responsable de cualquier altercado o problema que el <b>Qreador de Qontenido</b> pudiera tener directamente con dicha <b>Qomunidad</b>.
<br />
<br />
<b>16.2.- <u>Usando nuestros servicios es posible que el <b>Qreador de Qontenido</b> genere algún ingreso y por consecuencia es probable que legalmente este obligado a rendir cuentas a las autoridades fiscales competentes. Esto sigue siendo responsabilidad única y exclusivamente del <b>Qreador de Qontenido</b> y <b>Qapla</b> no está obligada a rendir cuentas a autoridad alguna para ninguno de sus impuestos personales. El <b>Qreador de Qontenido</b> indemnizará y nos reembolsará los costos, gastos o pérdidas que se puedan causar a nosotros como resultado de cualquier reclamo o demanda hecha por cualquier autoridad gubernamental u otra, en lo que respecta a las obligaciones de retención de impuestos u obligaciones similares a las que puede estar sujeto en relación con el procesamiento de premios o recompensas, O CUALQUIER CONFLICTO LEGAL CON TERCEROS.</u></b>
<br />
<br />

<h2>
17.- DEL SERVICIO DE PAGO PARA LOS QREADORES DE QONTENIDO:
</h2>

<b>17.1.-</b> Los <b>Qreadores de Qontenido</b> tendrán acceso de manera gratuita a todos los servicios antes descritos dentro de los presentes Términos y Condiciones con excepción de los que se describirán en el presente apartado.
<br />
<br />

<b>17.2.-</b> Los <b>Qreadores de Qontenido</b> tendrán la opción de acceder a un servicio de pago a través de distintas membresías dentro de la plataforma <b>Qapla</b>, mismo que contendrá los siguientes beneficios:

	<ol type='I'>
		<li>Publicar eventos dentro de la aplicación <b>Qapla</b>. El número de eventos que tengan derecho a publicar cada <b>Qreador de Qontenido</b> dependerá de la membresía que este último haya adquirido;</li>
		<li>Adquirir un <b>Qapla</b> Boost que incrementará el canje de Qoins por Bits de 5 bits cada 200 Qoins a 10 bits cada 200 Qoins;</li>
		<li>Se eliminará el requisito mínimo para el retiro de Bits (250 Bits), pudiendo el <b>Qreador de Qontenido</b> retirar cualquier cantidad sin restricción alguna;</li>
		<li>Participar en sorteos y eventos exclusivos; y</li>
		<li>Recibir suscripciones de regalo al Canal del Creador de Contenido por parte de la <b>Qomunidad</b>.</li>
	</ol>
<br />

<h2>
18.- REGLAS Y PROCEDIMIENTO QUE DEBE OBSERVAR TODO CREADOR DE CONTENIDO:
</h2>

<b>18.1.-</b> Dentro de los eventos publicados en <b>Qapla</b> por parte de los Qreadores de Qontenido se deberán observar las siguientes reglas:
	<ol type='1'>
		<li>Al iniciar la transmisión, el <b>Qreador de Qontenido</b> deberá activar su evento desde el Dashboard de <b>Qapla</b> <u><b>(esto es necesario para que la Comunidad pueda canjear las recompensas dentro de dicha transmisión, caso contrario no será posible realizar los canjes correspondientes).</b></u></li>
		<li>Al activar el evento se creará la recompensa de XQ. Para activar la recompensa de Qoins deben hacerlo a través de la opción de “Gestionar evento” dentro del Dashboard. Se sugiere que el evento quede activado durante 2 horas 30 minutos para que se puedan realizar los canjes correspondientes de Qoins y XQ y obtener los mejores rendimientos dentro de la plataforma.</li>
		<li>Al terminar el evento, este puede ser cerrado a través del mismo Dashboard de <b>Qapla</b>.</li>
	</ol>
	<br />
		En caso de que el <b>Qreador de Qontenido</b> no pueda realizar el evento por cuestiones ajenas, este último puede cambiar la fecha y hora programada hasta antes de 10 minutos. Caso contrario se perderá el evento y no será reembolsable. Los Qoins en los eventos serán limitados. Si por causas no imputables a <b>Qapla</b> o de los Qreadores de Qontenido, existieren fallas o errores, <b>Qapla</b> únicamente entregará los Qoins conforme los límites establecidos para cada evento sin poder exceder de estos mismos. <u><b>Lo anterior será a discreción exclusiva de <b>Qapla</b>.</b></u> Se considera un máximo de 40 canjes de Qoins por evento.
<br />
<br />

            </DialogContent>
        </Dialog>
    );
}

export default QaplaTerms;