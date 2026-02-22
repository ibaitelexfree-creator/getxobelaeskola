import type { Question } from "@/components/academy/evaluation/types";

export interface ExamQuestion extends Question {
	correctAnswer: string;
	category: string;
}

export const perExamQuestions: ExamQuestion[] = [
	// 1. Nomenclatura Náutica (5)
	{
		id: "nom-001",
		tipo_pregunta: "opcion_multiple",
		category: "Nomenclatura Náutica",
		puntos: 1,
		enunciado_es: "¿Cómo se denomina la parte trasera de una embarcación?",
		enunciado_eu: "Nola deitzen da ontzi baten atzeko aldea?",
		opciones_json: [
			{ id: "a", texto: "Proa" },
			{ id: "b", texto: "Popa" },
			{ id: "c", texto: "Babor" },
			{ id: "d", texto: "Estribor" },
		],
		correctAnswer: "b",
	},
	{
		id: "nom-002",
		tipo_pregunta: "opcion_multiple",
		category: "Nomenclatura Náutica",
		puntos: 1,
		enunciado_es:
			"La distancia vertical desde la línea de flotación hasta la cubierta principal se llama:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Calado" },
			{ id: "b", texto: "Puntal" },
			{ id: "c", texto: "Francobordo" },
			{ id: "d", texto: "Manga" },
		],
		correctAnswer: "c",
	},
	{
		id: "nom-003",
		tipo_pregunta: "opcion_multiple",
		category: "Nomenclatura Náutica",
		puntos: 1,
		enunciado_es: "¿Qué es la eslora?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "La anchura máxima de la embarcación" },
			{ id: "b", texto: "La longitud total de la embarcación" },
			{ id: "c", texto: "La altura del casco" },
			{ id: "d", texto: "La profundidad de la embarcación" },
		],
		correctAnswer: "b",
	},
	{
		id: "nom-004",
		tipo_pregunta: "opcion_multiple",
		category: "Nomenclatura Náutica",
		puntos: 1,
		enunciado_es:
			"La estructura transversal que une los costados y soporta la cubierta se llama:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Cuaderna" },
			{ id: "b", texto: "Vao" },
			{ id: "c", texto: "Quilla" },
			{ id: "d", texto: "Roda" },
		],
		correctAnswer: "b",
	},
	{
		id: "nom-005",
		tipo_pregunta: "opcion_multiple",
		category: "Nomenclatura Náutica",
		puntos: 1,
		enunciado_es: "¿Qué pieza cierra el casco por la parte delantera o proa?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Codaste" },
			{ id: "b", texto: "Roda" },
			{ id: "c", texto: "Espejo" },
			{ id: "d", texto: "Quilla" },
		],
		correctAnswer: "b",
	},

	// 2. Elementos de Amarre y Fondeo (3)
	{
		id: "fon-001",
		tipo_pregunta: "opcion_multiple",
		category: "Amarre y Fondeo",
		puntos: 1,
		enunciado_es: "¿Qué nombre recibe la acción de subir el ancla a bordo?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Fondear" },
			{ id: "b", texto: "Garrear" },
			{ id: "c", texto: "Levar" },
			{ id: "d", texto: "Arriar" },
		],
		correctAnswer: "c",
	},
	{
		id: "fon-002",
		tipo_pregunta: "opcion_multiple",
		category: "Amarre y Fondeo",
		puntos: 1,
		enunciado_es:
			"Al fondear, ¿qué longitud de cadena se recomienda filar si hay buen tiempo?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "1 vez la profundidad" },
			{ id: "b", texto: "3 veces la profundidad" },
			{ id: "c", texto: "5 veces la profundidad" },
			{ id: "d", texto: "10 veces la profundidad" },
		],
		correctAnswer: "b",
	},
	{
		id: "fon-003",
		tipo_pregunta: "opcion_multiple",
		category: "Amarre y Fondeo",
		puntos: 1,
		enunciado_es:
			"¿Qué nudo se utiliza habitualmente para afirmar una amarra a un noray?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "As de guía" },
			{ id: "b", texto: "Vuelta de rezón" },
			{ id: "c", texto: "Ballestrinque" },
			{ id: "d", texto: "Llano" },
		],
		correctAnswer: "a",
	},

	// 3. Seguridad en la Mar (5)
	{
		id: "seg-001",
		tipo_pregunta: "opcion_multiple",
		category: "Seguridad",
		puntos: 1,
		enunciado_es: "¿Cuál es la señal radiotelefónica de socorro?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "PAN PAN" },
			{ id: "b", texto: "MAYDAY" },
			{ id: "c", texto: "SECURITE" },
			{ id: "d", texto: "SOS" },
		],
		correctAnswer: "b",
	},
	{
		id: "seg-002",
		tipo_pregunta: "opcion_multiple",
		category: "Seguridad",
		puntos: 1,
		enunciado_es:
			"Para apagar un incendio de combustible líquido (Clase B), ¿qué extintor es más adecuado?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Agua a chorro" },
			{ id: "b", texto: "Polvo seco o CO2" },
			{ id: "c", texto: "Arena" },
			{ id: "d", texto: "Manta ignífuga" },
		],
		correctAnswer: "b",
	},
	{
		id: "seg-003",
		tipo_pregunta: "opcion_multiple",
		category: "Seguridad",
		puntos: 1,
		enunciado_es:
			"¿Qué es obligatorio llevar puesto en cubierta con mal tiempo?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Arnés de seguridad" },
			{ id: "b", texto: "Ropa impermeable" },
			{ id: "c", texto: "Guantes" },
			{ id: "d", texto: "Gorra" },
		],
		correctAnswer: "a",
	},
	{
		id: "seg-004",
		tipo_pregunta: "opcion_multiple",
		category: "Seguridad",
		puntos: 1,
		enunciado_es:
			"¿Cuándo se considera que una embarcación tiene estabilidad positiva?",
		enunciado_eu: "",
		opciones_json: [
			{
				id: "a",
				texto: "Cuando al escorar tiende a volver a su posición inicial",
			},
			{ id: "b", texto: "Cuando al escorar vuelca inmediatamente" },
			{ id: "c", texto: "Cuando permanece escorada sin moverse" },
			{
				id: "d",
				texto: "Cuando el centro de gravedad está por encima del metacentro",
			},
		],
		correctAnswer: "a",
	},
	{
		id: "seg-005",
		tipo_pregunta: "opcion_multiple",
		category: "Seguridad",
		puntos: 1,
		enunciado_es:
			"¿Qué elemento de seguridad es obligatorio para todos los tripulantes?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Traje de supervivencia" },
			{ id: "b", texto: "Chaleco salvavidas" },
			{ id: "c", texto: "Radio portátil" },
			{ id: "d", texto: "Bengalas de mano" },
		],
		correctAnswer: "b",
	},

	// 4. Legislación (3)
	{
		id: "leg-001",
		tipo_pregunta: "opcion_multiple",
		category: "Legislación",
		puntos: 1,
		enunciado_es:
			"¿Cuál es la distancia mínima a la costa para descargar aguas sucias sin tratar?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "3 millas" },
			{ id: "b", texto: "4 millas" },
			{ id: "c", texto: "12 millas" },
			{ id: "d", texto: "Está prohibido siempre" },
		],
		correctAnswer: "c",
	},
	{
		id: "leg-002",
		tipo_pregunta: "opcion_multiple",
		category: "Legislación",
		puntos: 1,
		enunciado_es: "¿Qué documento acredita la nacionalidad de la embarcación?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "El Permiso de Navegación" },
			{ id: "b", texto: "El Certificado de Navegabilidad" },
			{ id: "c", texto: "La Patente de Navegación" },
			{ id: "d", texto: "La Licencia de Estación de Barco" },
		],
		correctAnswer: "c",
	},
	{
		id: "leg-003",
		tipo_pregunta: "opcion_multiple",
		category: "Legislación",
		puntos: 1,
		enunciado_es: "¿Dónde debe izarse el pabellón nacional?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "En la proa" },
			{ id: "b", texto: "En el palo mayor a estribor" },
			{ id: "c", texto: "En la popa" },
			{ id: "d", texto: "En el palo trinquete" },
		],
		correctAnswer: "c",
	},

	// 5. Balizamiento (6)
	{
		id: "bal-001",
		tipo_pregunta: "opcion_multiple",
		category: "Balizamiento",
		puntos: 1,
		enunciado_es:
			"En la Región A (Europa), ¿de qué color es la marca lateral de estribor al entrar a puerto?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Roja" },
			{ id: "b", texto: "Verde" },
			{ id: "c", texto: "Amarilla" },
			{ id: "d", texto: "Negra" },
		],
		correctAnswer: "b",
	},
	{
		id: "bal-002",
		tipo_pregunta: "opcion_multiple",
		category: "Balizamiento",
		puntos: 1,
		enunciado_es:
			"¿Qué forma tiene la marca de tope de una boya de peligro aislado?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Dos esferas negras superpuestas" },
			{ id: "b", texto: "Dos conos negros con los vértices hacia arriba" },
			{ id: "c", texto: "Una esfera roja" },
			{ id: "d", texto: "Un aspa amarilla" },
		],
		correctAnswer: "a",
	},
	{
		id: "bal-003",
		tipo_pregunta: "opcion_multiple",
		category: "Balizamiento",
		puntos: 1,
		enunciado_es:
			"¿Qué indica una boya con franjas verticales rojas y blancas?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Aguas navegables" },
			{ id: "b", texto: "Peligro aislado" },
			{ id: "c", texto: "Bifurcación" },
			{ id: "d", texto: "Canal principal a estribor" },
		],
		correctAnswer: "a",
	},
	{
		id: "bal-004",
		tipo_pregunta: "opcion_multiple",
		category: "Balizamiento",
		puntos: 1,
		enunciado_es: "¿Cuál es la marca de tope de una boya Cardinal Norte?",
		enunciado_eu: "",
		opciones_json: [
			{
				id: "a",
				texto: "Dos conos negros superpuestos con los vértices hacia arriba",
			},
			{
				id: "b",
				texto: "Dos conos negros superpuestos con los vértices hacia abajo",
			},
			{ id: "c", texto: "Dos conos negros opuestos por la base" },
			{ id: "d", texto: "Dos conos negros opuestos por el vértice" },
		],
		correctAnswer: "a",
	},
	{
		id: "bal-005",
		tipo_pregunta: "opcion_multiple",
		category: "Balizamiento",
		puntos: 1,
		enunciado_es: "Las marcas especiales son de color:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Blanco" },
			{ id: "b", texto: "Amarillo" },
			{ id: "c", texto: "Naranja" },
			{ id: "d", texto: "Azul" },
		],
		correctAnswer: "b",
	},
	{
		id: "bal-006",
		tipo_pregunta: "opcion_multiple",
		category: "Balizamiento",
		puntos: 1,
		enunciado_es:
			"Si vemos una boya verde con una franja roja horizontal en el centro, indica:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Canal principal a estribor" },
			{ id: "b", texto: "Canal principal a babor" },
			{ id: "c", texto: "Zona de pesca prohibida" },
			{ id: "d", texto: "Nuevo peligro" },
		],
		correctAnswer: "b",
	},

	// 6. RIPA (12)
	{
		id: "ripa-001",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es:
			"En una situación de cruce entre dos buques de propulsión mecánica, ¿quién debe maniobrar?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "El que tiene al otro por su costado de babor" },
			{ id: "b", texto: "El que tiene al otro por su costado de estribor" },
			{ id: "c", texto: "El más pequeño" },
			{ id: "d", texto: "El más rápido" },
		],
		correctAnswer: "b",
	},
	{
		id: "ripa-002",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es:
			"¿Qué luces debe exhibir un buque de propulsión mecánica en navegación de noche?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Luces de costado y alcance" },
			{ id: "b", texto: "Luz de tope, luces de costado y luz de alcance" },
			{ id: "c", texto: "Todo horizonte blanca y luces de costado" },
			{ id: "d", texto: "Solo luces de costado" },
		],
		correctAnswer: "b",
	},
	{
		id: "ripa-003",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es: 'Un buque "sin gobierno" de día exhibirá:',
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Dos esferas negras" },
			{ id: "b", texto: "Tres esferas negras" },
			{ id: "c", texto: "Un cilindro negro" },
			{ id: "d", texto: "Un cono con el vértice hacia abajo" },
		],
		correctAnswer: "a",
	},
	{
		id: "ripa-004",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es: "¿Qué significa un sonido de una pitada corta?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Caigo a estribor" },
			{ id: "b", texto: "Caigo a babor" },
			{ id: "c", texto: "Doy atrás" },
			{ id: "d", texto: "Estoy fondeado" },
		],
		correctAnswer: "a",
	},
	{
		id: "ripa-005",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es:
			"En caso de vuelta encontrada (de frente), ¿cómo deben maniobrar los buques?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Ambos caen a babor" },
			{ id: "b", texto: "Ambos caen a estribor" },
			{ id: "c", texto: "Uno para y otro sigue" },
			{ id: "d", texto: "Siguen a rumbo" },
		],
		correctAnswer: "b",
	},
	{
		id: "ripa-006",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es:
			"¿Qué buque tiene preferencia: un velero o un buque de propulsión mecánica?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "El buque de propulsión mecánica" },
			{
				id: "b",
				texto:
					"El velero (salvo excepciones como capacidad de maniobra restringida)",
			},
			{ id: "c", texto: "Siempre el velero" },
			{ id: "d", texto: "El que venga por la derecha" },
		],
		correctAnswer: "b",
	},
	{
		id: "ripa-007",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es: "¿Qué luces exhibe un buque fondeado menor de 50 metros?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Dos luces rojas todo horizonte" },
			{
				id: "b",
				texto: "Una luz blanca todo horizonte en el lugar más visible",
			},
			{ id: "c", texto: "Luces de costado y alcance" },
			{ id: "d", texto: "Luz amarilla centelleante" },
		],
		correctAnswer: "b",
	},
	{
		id: "ripa-008",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es:
			"Si oímos dos pitadas largas cada dos minutos en niebla, indica:",
		enunciado_eu: "",
		opciones_json: [
			{
				id: "a",
				texto: "Buque de propulsión mecánica en navegación con arrancada",
			},
			{
				id: "b",
				texto: "Buque de propulsión mecánica en navegación sin arrancada",
			},
			{ id: "c", texto: "Buque fondeado" },
			{ id: "d", texto: "Buque varado" },
		],
		correctAnswer: "b",
	},
	{
		id: "ripa-009",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es:
			"¿Qué indica una luz amarilla sobre una blanca todo horizonte?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Pesquero de arrastre" },
			{ id: "b", texto: "Remolcador" },
			{ id: "c", texto: "Práctico" },
			{ id: "d", texto: "Buque restringido por su calado" },
		],
		correctAnswer: "b",
	},
	{
		id: "ripa-010",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es: "En un canal angosto, los buques deben mantenerse:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "En el centro del canal" },
			{
				id: "b",
				texto:
					"Lo más cerca posible del límite exterior que quede por su estribor",
			},
			{
				id: "c",
				texto:
					"Lo más cerca posible del límite exterior que quede por su babor",
			},
			{ id: "d", texto: "Donde haya más calado indistintamente" },
		],
		correctAnswer: "b",
	},
	{
		id: "ripa-011",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es:
			"¿Qué buque exhibe tres luces todo horizonte en línea vertical: roja, blanca, roja?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Sin gobierno" },
			{ id: "b", texto: "Restringido por su calado" },
			{ id: "c", texto: "Con capacidad de maniobra restringida" },
			{ id: "d", texto: "Pesquero" },
		],
		correctAnswer: "c",
	},
	{
		id: "ripa-012",
		tipo_pregunta: "opcion_multiple",
		category: "RIPA",
		puntos: 1,
		enunciado_es: "¿Qué es un buque que alcanza?",
		enunciado_eu: "",
		opciones_json: [
			{
				id: "a",
				texto:
					"El que se aproxima a otro viniendo desde una dirección de más de 22.5 grados a popa del través",
			},
			{ id: "b", texto: "El que viene por la proa" },
			{ id: "c", texto: "El que navega a mayor velocidad" },
			{ id: "d", texto: "El que cruza por estribor" },
		],
		correctAnswer: "a",
	},

	// 7. Maniobra (3)
	{
		id: "man-001",
		tipo_pregunta: "opcion_multiple",
		category: "Maniobra",
		puntos: 1,
		enunciado_es: "La corriente que expulsa la hélice al girar se denomina:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Corriente de aspiración" },
			{ id: "b", texto: "Corriente de expulsión" },
			{ id: "c", texto: "Presión lateral de las palas" },
			{ id: "d", texto: "Cavitación" },
		],
		correctAnswer: "b",
	},
	{
		id: "man-002",
		tipo_pregunta: "opcion_multiple",
		category: "Maniobra",
		puntos: 1,
		enunciado_es:
			"Para amarrar de punta (popa al muelle), ¿qué cabo se da primero habitualmente?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "El largo de proa" },
			{ id: "b", texto: "La codera" },
			{ id: "c", texto: "El spring" },
			{ id: "d", texto: "La guía" },
		],
		correctAnswer: "a",
	},
	{
		id: "man-003",
		tipo_pregunta: "opcion_multiple",
		category: "Maniobra",
		puntos: 1,
		enunciado_es:
			"¿Qué efecto produce la presión lateral de las palas en una hélice dextrógira dando atrás?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "La popa cae a estribor" },
			{ id: "b", texto: "La popa cae a babor" },
			{ id: "c", texto: "La proa cae a babor" },
			{ id: "d", texto: "El barco va recto" },
		],
		correctAnswer: "b",
	},

	// 8. Emergencias (4)
	{
		id: "eme-001",
		tipo_pregunta: "opcion_multiple",
		category: "Emergencias",
		puntos: 1,
		enunciado_es:
			'En caso de "Hombre al agua", la maniobra de Anderson consiste en:',
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Dar un giro de 180º" },
			{ id: "b", texto: "Dar un giro completo de 360º" },
			{ id: "c", texto: "Parar máquinas y esperar" },
			{ id: "d", texto: "Navegar marcha atrás" },
		],
		correctAnswer: "b",
	},
	{
		id: "eme-002",
		tipo_pregunta: "opcion_multiple",
		category: "Emergencias",
		puntos: 1,
		enunciado_es:
			"Si fallan el sistema de gobierno hidráulico y el de emergencia, ¿cómo podemos gobernar?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Con las velas o jugando con los motores si son dos" },
			{ id: "b", texto: "Con el ancla" },
			{ id: "c", texto: "No se puede hacer nada" },
			{ id: "d", texto: "Llamando a Salvamento Marítimo" },
		],
		correctAnswer: "a",
	},
	{
		id: "eme-003",
		tipo_pregunta: "opcion_multiple",
		category: "Emergencias",
		puntos: 1,
		enunciado_es:
			"¿Cuál es la forma más efectiva de dar remolque con mal tiempo?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Abarloado" },
			{ id: "b", texto: "Por popa con cabo largo" },
			{ id: "c", texto: "Por popa con cabo corto" },
			{ id: "d", texto: "Empujando" },
		],
		correctAnswer: "b",
	},
	{
		id: "eme-004",
		tipo_pregunta: "opcion_multiple",
		category: "Emergencias",
		puntos: 1,
		enunciado_es:
			"Antes de abandonar el barco en una balsa salvavidas, debemos:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Beber mucha agua" },
			{ id: "b", texto: "Ponerse ropa de abrigo y el chaleco salvavidas" },
			{ id: "c", texto: "Nadar un rato" },
			{ id: "d", texto: "Inflar la balsa en cubierta" },
		],
		correctAnswer: "b",
	},

	// 9. Meteorología (5)
	{
		id: "met-001",
		tipo_pregunta: "opcion_multiple",
		category: "Meteorología",
		puntos: 1,
		enunciado_es: "¿Qué instrumento mide la presión atmosférica?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Termómetro" },
			{ id: "b", texto: "Barómetro" },
			{ id: "c", texto: "Higrómetro" },
			{ id: "d", texto: "Anemómetro" },
		],
		correctAnswer: "b",
	},
	{
		id: "met-002",
		tipo_pregunta: "opcion_multiple",
		category: "Meteorología",
		puntos: 1,
		enunciado_es: "Las líneas isobaras juntas en un mapa del tiempo indican:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Viento fuerte" },
			{ id: "b", texto: "Calma" },
			{ id: "c", texto: "Lluvia intensa" },
			{ id: "d", texto: "Alta temperatura" },
		],
		correctAnswer: "a",
	},
	{
		id: "met-003",
		tipo_pregunta: "opcion_multiple",
		category: "Meteorología",
		puntos: 1,
		enunciado_es: '¿Qué es el "Fetch"?',
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "La fuerza del viento" },
			{
				id: "b",
				texto:
					"La zona y distancia donde el viento sopla en la misma dirección y fuerza generando olas",
			},
			{ id: "c", texto: "La altura de las olas" },
			{ id: "d", texto: "La duración del temporal" },
		],
		correctAnswer: "b",
	},
	{
		id: "met-004",
		tipo_pregunta: "opcion_multiple",
		category: "Meteorología",
		puntos: 1,
		enunciado_es: "El viento que rola en sentido de las agujas del reloj:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Caer" },
			{ id: "b", texto: "Rolar" },
			{ id: "c", texto: "Veer" },
			{ id: "d", texto: "Refrescar" },
		],
		correctAnswer: "c",
	},
	{
		id: "met-005",
		tipo_pregunta: "opcion_multiple",
		category: "Meteorología",
		puntos: 1,
		enunciado_es: "¿Qué nubes suelen anunciar tormentas?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Cirros" },
			{ id: "b", texto: "Cúmulos" },
			{ id: "c", texto: "Cumulonimbos" },
			{ id: "d", texto: "Estratos" },
		],
		correctAnswer: "c",
	},

	// 10. Teoría de la Navegación (7)
	{
		id: "teo-001",
		tipo_pregunta: "opcion_multiple",
		category: "Teoría de Navegación",
		puntos: 1,
		enunciado_es: "¿Qué es la latitud?",
		enunciado_eu: "",
		opciones_json: [
			{
				id: "a",
				texto: "El arco de ecuador contado desde el meridiano de Greenwich",
			},
			{
				id: "b",
				texto: "El arco de meridiano contado desde el ecuador hasta el punto",
			},
			{ id: "c", texto: "La distancia al polo norte" },
			{ id: "d", texto: "El ángulo entre el norte magnético y el geográfico" },
		],
		correctAnswer: "b",
	},
	{
		id: "teo-002",
		tipo_pregunta: "opcion_multiple",
		category: "Teoría de Navegación",
		puntos: 1,
		enunciado_es: "Una milla náutica equivale a:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "1000 metros" },
			{ id: "b", texto: "1852 metros" },
			{ id: "c", texto: "1609 metros" },
			{ id: "d", texto: "2000 metros" },
		],
		correctAnswer: "b",
	},
	{
		id: "teo-003",
		tipo_pregunta: "opcion_multiple",
		category: "Teoría de Navegación",
		puntos: 1,
		enunciado_es: "El Rumbo Verdadero es igual a:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Rumbo de Aguja + Corrección Total" },
			{ id: "b", texto: "Rumbo de Aguja - Corrección Total" },
			{ id: "c", texto: "Rumbo Magnético + Desvío" },
			{ id: "d", texto: "Rumbo de Superficie + Abatimiento" },
		],
		correctAnswer: "a",
	},
	{
		id: "teo-004",
		tipo_pregunta: "opcion_multiple",
		category: "Teoría de Navegación",
		puntos: 1,
		enunciado_es: "¿Qué es el desvío?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "El ángulo entre el Norte Geográfico y el Magnético" },
			{
				id: "b",
				texto: "El ángulo entre el Norte Magnético y el Norte de Aguja",
			},
			{ id: "c", texto: "El error del compás por el viento" },
			{ id: "d", texto: "La deriva por la corriente" },
		],
		correctAnswer: "b",
	},
	{
		id: "teo-005",
		tipo_pregunta: "opcion_multiple",
		category: "Teoría de Navegación",
		puntos: 1,
		enunciado_es: "La corrección total (Ct) se calcula como:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "dm + desvío" },
			{ id: "b", texto: "dm - desvío" },
			{ id: "c", texto: "Ra + dm" },
			{ id: "d", texto: "Rv - Ra" },
		],
		correctAnswer: "a",
	},
	{
		id: "teo-006",
		tipo_pregunta: "opcion_multiple",
		category: "Teoría de Navegación",
		puntos: 1,
		enunciado_es: "¿Cómo se mide la sonda en una carta náutica?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "En brazas" },
			{ id: "b", texto: "En pies" },
			{ id: "c", texto: "En metros (generalmente)" },
			{ id: "d", texto: "En millas" },
		],
		correctAnswer: "c",
	},
	{
		id: "teo-007",
		tipo_pregunta: "opcion_multiple",
		category: "Teoría de Navegación",
		puntos: 1,
		enunciado_es: "¿Qué es una enfilación?",
		enunciado_eu: "",
		opciones_json: [
			{
				id: "a",
				texto: "La unión visual de dos objetos en una misma línea de posición",
			},
			{ id: "b", texto: "El cruce de dos demoras" },
			{ id: "c", texto: "Una marcación de 90 grados" },
			{ id: "d", texto: "Una demora de seguridad" },
		],
		correctAnswer: "a",
	},

	// 11. Carta de Navegación (7)
	{
		id: "car-001",
		tipo_pregunta: "opcion_multiple",
		category: "Carta de Navegación",
		puntos: 1,
		enunciado_es:
			"Si navegamos al Rumbo Verdadero 090º y tenemos un viento del Norte que nos abate 10º, ¿cuál es el Rumbo de Superficie?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "080º" },
			{ id: "b", texto: "100º" },
			{ id: "c", texto: "090º" },
			{ id: "d", texto: "110º" },
		],
		correctAnswer: "b",
	},
	{
		id: "car-002",
		tipo_pregunta: "opcion_multiple",
		category: "Carta de Navegación",
		puntos: 1,
		enunciado_es:
			"Dada una declinación magnética de 2º NW y un desvío de 4º NE. ¿Cuál es la Corrección Total?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "+2º" },
			{ id: "b", texto: "-2º" },
			{ id: "c", texto: "+6º" },
			{ id: "d", texto: "-6º" },
		],
		correctAnswer: "a",
	},
	{
		id: "car-003",
		tipo_pregunta: "opcion_multiple",
		category: "Carta de Navegación",
		puntos: 1,
		enunciado_es:
			"Si tomamos simultáneamente demora a un faro A y distancia al mismo faro A, obtenemos:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "Una situación fiable" },
			{ id: "b", texto: "Una enfilación" },
			{ id: "c", texto: "Una oposición" },
			{ id: "d", texto: "No sirve para situarse" },
		],
		correctAnswer: "a",
	},
	{
		id: "car-004",
		tipo_pregunta: "opcion_multiple",
		category: "Carta de Navegación",
		puntos: 1,
		enunciado_es: "Para trazar un rumbo en la carta, utilizamos:",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "El compás de puntas secas" },
			{ id: "b", texto: "El transportador de ángulos o reglas paralelas" },
			{ id: "c", texto: "La alidada" },
			{ id: "d", texto: "El taxímetro" },
		],
		correctAnswer: "b",
	},
	{
		id: "car-005",
		tipo_pregunta: "opcion_multiple",
		category: "Carta de Navegación",
		puntos: 1,
		enunciado_es: "¿Qué escala es más detallada?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "1:50.000" },
			{ id: "b", texto: "1:100.000" },
			{ id: "c", texto: "1:10.000" },
			{ id: "d", texto: "1:1.000.000" },
		],
		correctAnswer: "c",
	},
	{
		id: "car-006",
		tipo_pregunta: "opcion_multiple",
		category: "Carta de Navegación",
		puntos: 1,
		enunciado_es:
			"Si navegamos con Rv = 045º durante 2 horas a una velocidad de 10 nudos, ¿qué distancia hemos recorrido?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "10 millas" },
			{ id: "b", texto: "20 millas" },
			{ id: "c", texto: "45 millas" },
			{ id: "d", texto: "5 millas" },
		],
		correctAnswer: "b",
	},
	{
		id: "car-007",
		tipo_pregunta: "opcion_multiple",
		category: "Carta de Navegación",
		puntos: 1,
		enunciado_es:
			"En la carta del Estrecho de Gibraltar, ¿dónde se miden las distancias?",
		enunciado_eu: "",
		opciones_json: [
			{ id: "a", texto: "En la escala de longitudes (horizontal)" },
			{ id: "b", texto: "En la escala de latitudes (vertical)" },
			{ id: "c", texto: "En la rosa de los vientos" },
			{ id: "d", texto: "En cualquier borde" },
		],
		correctAnswer: "b",
	},
];
