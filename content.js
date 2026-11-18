// Contenido de ejemplo para el MVP de EduRural.
// Formato de cada pregunta: [enunciado, [respuesta correcta, ...incorrectas], pista]
// Al cargarse, las opciones se reordenan para que la correcta no quede siempre de primera.
module.exports = [
  {
    nombre: 'Matemáticas',
    grado: 5,
    icono: '➗',
    lecciones: [
      {
        nivel: 1, titulo: '¿Qué es una fracción?', ilustracion: '🫓', mb: 4.2,
        contenido: [
          'Una fracción sirve para nombrar una parte de algo que se dividió en partes iguales.',
          'Si mamá parte una arepa en 4 pedazos iguales y tú te comes 1, te comiste 1/4 (un cuarto) de la arepa.',
          'El número de abajo se llama denominador: dice en cuántas partes iguales se dividió. El número de arriba se llama numerador: dice cuántas partes tomamos.'
        ],
        escenas: ['Una arepa entera 🫓', 'La partimos en 4 pedazos iguales', 'Tomamos 1 pedazo: eso es 1/4', 'Arriba va el numerador: las partes que tomamos', 'Abajo va el denominador: las partes en total'],
        preguntas: [
          ['En la fracción 3/4, ¿cuál es el denominador?', ['4', '3', '7', '1'], 'Es el número de abajo: dice en cuántas partes se dividió.'],
          ['Si partes una arepa en 2 partes iguales, cada parte es:', ['1/2', '2/1', '1/4', '2/2'], 'Una parte de dos partes en total.'],
          ['El número de arriba de una fracción se llama:', ['Numerador', 'Denominador', 'Entero', 'Divisor'], 'Dice cuántas partes tomamos.']
        ]
      },
      {
        nivel: 2, titulo: 'Fracciones que valen lo mismo', ilustracion: '⚖️', mb: 4.8,
        contenido: [
          'Media panela es lo mismo que dos cuartos de panela: 1/2 = 2/4. A estas fracciones las llamamos equivalentes.',
          'Si multiplicamos el número de arriba y el de abajo por el mismo número, la fracción vale lo mismo.',
          'Mientras en más partes se divida el entero, más pequeña es cada parte: 1/8 de queso es menos que 1/2.'
        ],
        escenas: ['Una panela entera', 'La partimos por la mitad: 1/2', 'Ahora cada mitad en dos: 2/4', '¡Es la misma cantidad de panela!'],
        preguntas: [
          ['¿Qué fracción vale lo mismo que 1/2?', ['2/4', '1/3', '3/4', '2/3'], 'Multiplica arriba y abajo por 2.'],
          ['Un lote se divide en 4 partes y siembras 2. ¿Qué parte sembraste?', ['La mitad', 'Un cuarto', 'Todo el lote', 'Tres cuartos'], '2 de 4 es lo mismo que 1 de 2.'],
          ['¿Cuál es más grande: 1/2 o 1/4?', ['1/2', '1/4', 'Son iguales', 'No se puede saber'], 'Piensa en una arepa partida en 2 y otra partida en 4.']
        ]
      },
      {
        nivel: 3, titulo: 'Sumar y restar fracciones', ilustracion: '☕', mb: 5.6,
        contenido: [
          'Si las fracciones tienen el mismo denominador, sumamos solo los números de arriba y dejamos igual el de abajo.',
          'Ejemplo: el lunes se recogió 2/8 del café del lote y el martes 3/8. En total: 2/8 + 3/8 = 5/8.',
          'Para restar se hace igual: 6/10 − 2/10 = 4/10.'
        ],
        escenas: ['Lote de café dividido en 8 partes ☕', 'Lunes: se recogen 2 partes (2/8)', 'Martes: se recogen 3 partes (3/8)', 'Total: 5 de 8 partes = 5/8'],
        preguntas: [
          ['Don José recogió 2/8 del café el lunes y 3/8 el martes. ¿Cuánto lleva?', ['5/8', '5/16', '6/8', '1/8'], 'Suma solo los números de arriba.'],
          ['3/5 + 1/5 =', ['4/5', '4/10', '3/5', '2/5'], 'El denominador se queda igual.'],
          ['Una botella tiene 6/10 de leche y se toman 2/10. ¿Cuánto queda?', ['4/10', '8/10', '4/20', '2/10'], 'Resta los números de arriba.']
        ]
      },
      {
        nivel: 4, titulo: 'Comparar y ordenar fracciones', ilustracion: '🌽', mb: 5.1,
        contenido: [
          'Para comparar fracciones, conviene que tengan el mismo denominador. Por ejemplo, 1/2 es lo mismo que 4/8.',
          'Así es fácil ver que 4/8 (la mitad) es más que 3/8.',
          'En una finca podemos ver qué parte del terreno ocupa cada cultivo y cuánto queda libre.'
        ],
        escenas: ['Finca dividida en 6 partes 🌽', '2 partes de maíz: 2/6', '3 partes de yuca: 3/6', 'Queda libre 1 parte: 1/6'],
        preguntas: [
          ['Ana comió 3/8 de un pastel y Luis 1/2. ¿Quién comió más?', ['Luis', 'Ana', 'Comieron igual', 'Ninguno comió'], '1/2 es lo mismo que 4/8.'],
          ['Ordena de menor a mayor: 1/2, 1/4, 3/4', ['1/4, 1/2, 3/4', '3/4, 1/2, 1/4', '1/2, 1/4, 3/4', '1/4, 3/4, 1/2'], 'Escríbelas en cuartos: 2/4, 1/4, 3/4.'],
          ['En una finca, 2/6 es maíz y 3/6 es yuca. ¿Qué parte queda libre?', ['1/6', '5/6', '2/6', 'Nada'], 'Todo el terreno es 6/6.']
        ]
      },
      {
        nivel: 5, titulo: '¿Quién tiene la razón?', ilustracion: '🤔', mb: 4.4,
        contenido: [
          'Evaluar es revisar si una idea es correcta y explicar por qué.',
          'Cuando alguien dice algo sobre fracciones, podemos comprobarlo dibujando las partes o usando fracciones equivalentes.',
          'También podemos decidir cuál es la mejor forma de repartir algo entre varias personas.'
        ],
        escenas: ['Pedro dice: 2/3 es menos que 1/3', 'Dibujamos un entero en 3 partes', 'Pintamos 2 partes y luego 1 parte', '¡2/3 es más! Pedro no tiene razón'],
        preguntas: [
          ['Pedro dice que 2/3 es menor que 1/3. ¿Tiene razón?', ['No, 2/3 es mayor', 'Sí, tiene razón', 'Son iguales', 'Depende del entero'], 'Dibuja las dos fracciones.'],
          ['María dice: "Si el denominador es más grande, cada parte es más pequeña". ¿Es correcto?', ['Sí', 'No', 'Solo con números pares', 'Solo si el numerador es cero'], 'Compara 1/2 con 1/10.'],
          ['Para repartir 3 panelas entre 4 personas, ¿cuánto le toca a cada una?', ['3/4 de panela', '1 panela', '4/3 de panela', '1/3 de panela'], 'Son 3 panelas divididas entre 4.']
        ]
      },
      {
        nivel: 6, titulo: 'Inventa con fracciones', ilustracion: '🥕', mb: 5.3,
        contenido: [
          'Crear es usar lo que sabes para inventar algo nuevo: una receta, un diseño o un problema.',
          'Por ejemplo, si una receta es para 4 personas y quieres hacerla para 8, necesitas el doble de cada ingrediente.',
          'También puedes diseñar una huerta dividiendo el terreno en fracciones.'
        ],
        escenas: ['Receta para 4 personas', 'Lleva 1/2 taza de azúcar', 'Para 8 personas: el doble', '1/2 + 1/2 = 1 taza'],
        preguntas: [
          ['Una receta para 4 personas lleva 1/2 taza de azúcar. Si la haces para 8, ¿cuánto usas?', ['1 taza', '1/4 de taza', '2 tazas', '1/2 taza'], 'Para el doble de personas, el doble de azúcar.'],
          ['Diseñas una huerta: 1/2 de tomate, 1/4 de cebolla y el resto de cilantro. ¿Qué parte es cilantro?', ['1/4', '1/2', '3/4', '1/8'], '1/2 es lo mismo que 2/4.'],
          ['¿Qué problema se resuelve con 1/3 + 1/3?', ['Juan come un tercio de arepa en la mañana y otro en la tarde', 'Juan parte una arepa en dos', 'Juan compra 3 arepas', 'Juan regala una arepa entera'], 'Busca dos partes de un tercio.']
        ]
      }
    ]
  },
  {
    nombre: 'Ciencias Naturales',
    grado: 5,
    icono: '🌱',
    lecciones: [
      {
        nivel: 1, titulo: 'Las partes de la planta', ilustracion: '🌱', mb: 3.9,
        contenido: [
          'Las plantas tienen raíz, tallo, hojas, flores y frutos. Cada parte tiene un trabajo.',
          'La raíz sostiene la planta y absorbe el agua del suelo. El tallo lleva el agua hasta las hojas.',
          'En las hojas la planta fabrica su alimento. La flor, cuando se poliniza, se convierte en fruto.'
        ],
        escenas: ['La raíz bebe agua del suelo 💧', 'El tallo la sube como una manguera', 'Las hojas fabrican el alimento ☀️', 'La flor se vuelve fruto 🍊'],
        preguntas: [
          ['¿Qué parte de la planta absorbe el agua del suelo?', ['La raíz', 'La hoja', 'La flor', 'El fruto'], 'Está debajo de la tierra.'],
          ['¿Dónde fabrica la planta su alimento?', ['En las hojas', 'En la raíz', 'En el fruto', 'En la semilla'], 'Es la parte verde que recibe el sol.'],
          ['¿Qué parte de la planta se convierte en fruto?', ['La flor', 'La raíz', 'El tallo', 'La hoja'], 'Las abejas la visitan.']
        ]
      },
      {
        nivel: 2, titulo: 'Cómo se alimentan las plantas', ilustracion: '☀️', mb: 4.6,
        contenido: [
          'Las plantas hacen su propio alimento con luz del sol, agua y aire. A esto se le llama fotosíntesis.',
          'Las hojas son verdes por la clorofila, que atrapa la luz del sol.',
          'Durante la fotosíntesis, las plantas sueltan oxígeno, el gas que respiramos.'
        ],
        escenas: ['El sol ilumina la hoja ☀️', 'La raíz trae agua', 'La hoja toma aire', 'Sale alimento para la planta y oxígeno para nosotros'],
        preguntas: [
          ['¿Qué necesita una planta para hacer fotosíntesis?', ['Luz, agua y aire', 'Solo tierra', 'Solo agua', 'Oscuridad'], 'Son tres cosas.'],
          ['¿Por qué las hojas son verdes?', ['Por la clorofila', 'Por el agua', 'Por el viento', 'Por la tierra'], 'Es la sustancia que atrapa la luz.'],
          ['¿Qué gas sueltan las plantas que nosotros respiramos?', ['Oxígeno', 'Dióxido de carbono', 'Humo', 'Vapor'], 'Lo necesitamos para vivir.']
        ]
      },
      {
        nivel: 3, titulo: 'El viaje del agua', ilustracion: '💧', mb: 5.2,
        contenido: [
          'El agua de ríos y charcos se calienta con el sol y sube como vapor: eso es evaporación.',
          'En el cielo, el vapor se enfría y forma gotitas que se juntan en nubes: eso es condensación.',
          'Cuando las gotas pesan mucho, caen como lluvia y el viaje vuelve a empezar.'
        ],
        escenas: ['El sol calienta el río ☀️', 'El agua sube como vapor', 'Se forman nubes ☁️', 'Llueve sobre la finca 🌧️'],
        preguntas: [
          ['Después de un aguacero, el charco desaparece con el sol. ¿Qué pasó?', ['El agua se evaporó', 'El agua se congeló', 'El agua se condensó', 'El agua se volvió tierra'], 'El calor convierte el agua en vapor.'],
          ['Las gotas que aparecen por fuera de un vaso con agua fría se forman por:', ['Condensación', 'Evaporación', 'Lluvia', 'Filtración'], 'El vapor del aire se enfría al tocar el vaso.'],
          ['¿Qué forman las gotitas de agua en el cielo?', ['Nubes', 'Ríos', 'Montañas', 'Arcoíris siempre'], 'Las ves blancas o grises.']
        ]
      },
      {
        nivel: 4, titulo: '¿Quién se come a quién?', ilustracion: '🐄', mb: 4.9,
        contenido: [
          'Una cadena alimenticia muestra quién se come a quién. Empieza siempre con una planta, que es el productor.',
          'Por ejemplo: pasto → vaca → ser humano. El pasto produce, la vaca come pasto y nosotros tomamos su leche.',
          'Si falta un eslabón, toda la cadena cambia. Sin abejas, por ejemplo, muchas plantas dan menos frutos.'
        ],
        escenas: ['El pasto crece con el sol 🌿', 'La vaca come pasto 🐄', 'Nosotros tomamos la leche 🥛', 'Si falta uno, la cadena se rompe'],
        preguntas: [
          ['En la cadena pasto → vaca → ser humano, ¿quién es el productor?', ['El pasto', 'La vaca', 'El ser humano', 'El sol'], 'Es quien fabrica su propio alimento.'],
          ['Si desaparecen las abejas, ¿qué pasa con los cultivos?', ['Dan menos frutos', 'Crecen más rápido', 'No pasa nada', 'Dan más frutos'], 'Las abejas llevan el polen de flor en flor.'],
          ['¿Por qué un arroyo se seca en el verano?', ['Llueve menos y se evapora más agua', 'Los peces se toman el agua', 'El agua se va a dormir', 'Las piedras absorben el agua'], 'Piensa en el viaje del agua.']
        ]
      },
      {
        nivel: 5, titulo: 'Cuidemos la finca', ilustracion: '🌳', mb: 4.3,
        contenido: [
          'Evaluar es decidir si una acción es buena o mala para el ambiente y explicar por qué.',
          'Quemar el monte daña el suelo y espanta a los animales. Botar basura al río contamina el agua de todos.',
          'Recoger agua lluvia, hacer compost y sembrar árboles son buenas decisiones para la finca.'
        ],
        escenas: ['Un vecino quiere quemar el monte 🔥', '¿Qué le pasa al suelo?', '¿Y a los animales?', 'Mejor: abonar con compost 🌳'],
        preguntas: [
          ['Un vecino quiere quemar el monte para sembrar. ¿Es buena idea?', ['No, daña el suelo y a los animales', 'Sí, siempre abona la tierra', 'Sí, es más rápido', 'No importa'], 'Piensa en los animales y el suelo.'],
          ['¿Cuál es la mejor forma de cuidar el agua en la finca?', ['Recoger agua lluvia y no botar basura al río', 'Lavar con jabón en el río', 'Regar a mediodía', 'Dejar la manguera abierta'], 'Busca la opción que no desperdicia ni contamina.'],
          ['¿Qué abono es mejor para la huerta escolar?', ['Compost de restos de cocina', 'Bolsas plásticas', 'Agua con jabón', 'Ceniza de llantas'], 'Viene de restos de comida.']
        ]
      },
      {
        nivel: 6, titulo: 'Mi huerta escolar', ilustracion: '🥬', mb: 5.5,
        contenido: [
          'Crear es diseñar algo nuevo con lo que aprendiste. ¡Vamos a planear una huerta escolar!',
          'Las plantas que necesitan mucho sol van donde no hay sombra. Las semillas necesitan agua, aire y luz para germinar.',
          'También puedes inventar un filtro casero de agua con capas de piedras, arena y algodón.'
        ],
        escenas: ['Elegimos un lugar con sol ☀️', 'Preparamos la tierra con compost', 'Sembramos las semillas 🌱', 'Regamos y cuidamos cada día 💧'],
        preguntas: [
          ['Diseñas una huerta: ¿dónde pones las plantas que necesitan mucho sol?', ['En un lugar sin sombra', 'Debajo de los árboles', 'Dentro del salón', 'En un cuarto oscuro'], 'Necesitan mucha luz.'],
          ['Para un experimento de germinación, ¿qué necesitas?', ['Semillas, algodón húmedo y luz', 'Semillas secas en una caja cerrada', 'Solo piedras', 'Aceite y sal'], 'Las semillas necesitan agua, aire y luz.'],
          ['Para hacer un filtro casero de agua, ¿qué capas usas de arriba hacia abajo?', ['Piedras, arena y algodón', 'Algodón, barro y hojas', 'Solo tierra', 'Azúcar y sal'], 'Las piedras grandes atrapan lo más grueso.']
        ]
      }
    ]
  }
];
