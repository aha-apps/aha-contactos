// seed.js — Datos semilla para AHA Contactos
window.SeedEngine = {
  yaSembrado: function () {
    return db.plantillas.count().then(function (count) { return count > 0; });
  },

  sembrar: function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.yaSembrado().then(function (sembrado) {
        if (sembrado) {
          UI.toast('Datos ya cargados', 'info');
          resolve();
          return;
        }

        UI.loading(true);

        var plantillas = [
          // Saludo
          {
            id: uuid(),
            nombre: 'Contacto inicial',
            contenido: 'Hola [nombre], soy [usuario] de [empresa]. Quería presentarme y contarte cómo podemos ayudarte a [beneficio]. ¿Te parece si agendamos una llamada de 10 minutos?',
            categoria: 'saludo',
            createdBy: 'seed',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: uuid(),
            nombre: 'Seguimiento de referencia',
            contenido: 'Hola [nombre], [referido] me comentó que podrías estar interesado en nuestros servicios. Me encantaría conversar contigo para entender tus necesidades y ver cómo podemos colaborar.',
            categoria: 'saludo',
            createdBy: 'seed',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          // Seguimiento
          {
            id: uuid(),
            nombre: 'Recordatorio amable',
            contenido: 'Hola [nombre], solo quería recordarte nuestra conversación sobre [tema]. ¿Has tenido oportunidad de revisarlo? Quedo atento a cualquier duda.',
            categoria: 'seguimiento',
            createdBy: 'seed',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: uuid(),
            nombre: 'Reactivación',
            contenido: 'Hola [nombre], hace tiempo que no tenemos noticias tuyas. En [empresa] seguimos comprometidos con ofrecerte el mejor servicio. ¿Te gustaría agendar una revisión de tus necesidades actuales?',
            categoria: 'seguimiento',
            createdBy: 'seed',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          // Oferta
          {
            id: uuid(),
            nombre: 'Propuesta comercial',
            contenido: 'Hola [nombre], tal como conversamos, te comparto nuestra propuesta para [producto/servicio]. Incluye [beneficios clave] por solo [precio]. ¿Te parece bien si la revisamos juntos?',
            categoria: 'oferta',
            createdBy: 'seed',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: uuid(),
            nombre: 'Descuento especial',
            contenido: 'Hola [nombre], como cliente valioso, queremos ofrecerte un descuento exclusivo del [porcentaje]% en [producto/servicio]. Válido hasta [fecha]. ¿Aprovechamos?',
            categoria: 'oferta',
            createdBy: 'seed',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          // Cobro
          {
            id: uuid(),
            nombre: 'Recordatorio de pago',
            contenido: 'Hola [nombre], te recordamos que tu factura por [monto] está próxima a vencer el [fecha]. Puedes realizar el pago por [método de pago]. ¿Te ayudo con alguna duda?',
            categoria: 'cobro',
            createdBy: 'seed',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: uuid(),
            nombre: 'Agradecimiento por pago',
            contenido: 'Hola [nombre], gracias por tu pago puntual. En [empresa] valoramos tu confianza. Quedamos a tus órdenes para lo que necesites.',
            categoria: 'cobro',
            createdBy: 'seed',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          // Cierre
          {
            id: uuid(),
            nombre: 'Cierre de venta',
            contenido: 'Hola [nombre], ¡gracias por confiar en nosotros! A partir de hoy tienes acceso a [producto/servicio]. Te comparto los próximos pasos: [pasos]. Estamos para ayudarte en cada etapa.',
            categoria: 'cierre',
            createdBy: 'seed',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: uuid(),
            nombre: 'Solicitud de testimonio',
            contenido: 'Hola [nombre], nos da gusto saber que estás satisfecho con [producto/servicio]. ¿Nos regalarías unas palabras sobre tu experiencia? Las compartiremos en nuestros canales (con tu permiso).',
            categoria: 'cierre',
            createdBy: 'seed',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        db.plantillas.bulkAdd(plantillas).then(function () {
          UI.loading(false);
          UI.toast(plantillas.length + ' plantillas cargadas automáticamente', 'success');
          resolve();
        }).catch(function (err) {
          UI.loading(false);
          reject(err);
        });
      }).catch(function (err) {
        UI.loading(false);
        reject(err);
      });
    });
  }
};
