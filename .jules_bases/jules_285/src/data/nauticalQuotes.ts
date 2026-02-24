export interface NauticalQuote {
    id: number;
    quote_es: string;
    quote_eu: string;
    author: string;
}

const nauticalQuotes: NauticalQuote[] = [
    { id: 1, quote_es: "No se puede descubrir nuevos océanos a menos que se tenga el coraje de perder de vista la costa.", quote_eu: "Ezin dira ozeano berriak aurkitu kostaldea begietatik galtzeko ausardia ez bada.", author: "André Gide" },
    { id: 2, quote_es: "El pesimista se queja del viento; el optimista espera que cambie; el realista ajusta las velas.", quote_eu: "Ezkorra haizeaz kexatzen da; baikorra aldatzearen zain dago; errealista belak doitzen ditu.", author: "William Arthur Ward" },
    { id: 3, quote_es: "Un barco en el puerto es seguro, pero no es para eso que se construyen los barcos.", quote_eu: "Itsasontzia portuan seguru dago, baina ez da horretarako eraikitzen.", author: "John A. Shedd" },
    { id: 4, quote_es: "Veinte años desde ahora estarás más decepcionado por las cosas que no hiciste que por las que hiciste. Suelta amarras.", quote_eu: "Hogei urte barru, egin ez zenituenetik handiagoa izango da zure atsekabea egin zenituzuenetik baino. Askatu amarrak.", author: "Mark Twain" },
    { id: 5, quote_es: "No es la fuerza del vendaval, sino la posición de las velas, lo que determina el rumbo.", quote_eu: "Ez da ekaitzaren indarra, belen posizioa baizik, norabidea zehazten duena.", author: "Proverbio marinero" },
    { id: 6, quote_es: "El mar cura todas las heridas.", quote_eu: "Itsasoak zauri guztiak sendatzen ditu.", author: "Proverbio marinero" },
    { id: 7, quote_es: "La mejor madera no crece con facilidad; cuanto más fuerte el viento, más fuerte los árboles.", quote_eu: "Egur onena ez da erraz hazten; zenbat eta haize indartsuagoa, orduan eta zuhaitz sendoagoak.", author: "J. Willard Marriott" },
    { id: 8, quote_es: "Sólo aquellos que se arriesgan a ir demasiado lejos pueden descubrir hasta dónde pueden llegar.", quote_eu: "Urrunegi joateko arriskua hartzen dutenek soilik jakin dezakete noraino iritsi daitezkeen.", author: "T.S. Eliot" },
    { id: 9, quote_es: "El mar es todo. Cubre siete décimas del globo terrestre.", quote_eu: "Itsasoa da dena. Lur-globoaren hamarretatik zazpi estaltzen ditu.", author: "Julio Verne" },
    { id: 10, quote_es: "Un buen marinero no se hace en aguas tranquilas.", quote_eu: "Marinel ona ez da ur lasaietan egiten.", author: "Proverbio africano" },
    { id: 11, quote_es: "La tierra fue creada para aquellos que temen al mar.", quote_eu: "Lurra itsasoari beldur diztenentzat sortu zen.", author: "Proverbio portugués" },
    { id: 12, quote_es: "Navegar es necesario, vivir no es necesario.", quote_eu: "Nabigatzea beharrezkoa da, bizitzea ez da beharrezkoa.", author: "Pompeyo" },
    { id: 13, quote_es: "El viento y las olas están siempre del lado del navegante más hábil.", quote_eu: "Haizea eta olatuak beti nabigatzaile trebeanaren alde daude.", author: "Edward Gibbon" },
    { id: 14, quote_es: "Para llegar a puerto, hay que navegar, a veces con el viento y a veces contra él.", quote_eu: "Portura iristeko, nabigatu behar da, batzuetan haizearekin eta batzuetan haren aurka.", author: "Oliver Wendell Holmes" },
    { id: 15, quote_es: "No hay viento favorable para quien no sabe a dónde va.", quote_eu: "Ez dago haize onuragarririk nora doan ez dakienarentzat.", author: "Séneca" },
    { id: 16, quote_es: "El mar vive en cada uno de nosotros.", quote_eu: "Itsasoa gure bakoitzaren barruan bizi da.", author: "Robert Wyland" },
    { id: 17, quote_es: "La voz del mar habla al alma.", quote_eu: "Itsasoaren ahotsak arimari hitz egiten dio.", author: "Kate Chopin" },
    { id: 18, quote_es: "Un marinero sin destino nunca tiene viento a favor.", quote_eu: "Helmugrik gabeko marinel batek ez du inoiz haize aldekoa.", author: "Proverbio marinero" },
    { id: 19, quote_es: "En el mar aprendes cuán pequeño eres y cuán grande puede ser tu determinación.", quote_eu: "Itsasoan ikasten duzu zein txikia zaren eta zein handia izan daitekeen zure erabakitasuna.", author: "Proverbio marinero" },
    { id: 20, quote_es: "El mar no recompensa a los apresurados, sino a los perseverantes.", quote_eu: "Itsasoak ez ditu presadunak saritzen, iraunkorrak baizik.", author: "Proverbio marinero" },
    { id: 21, quote_es: "Cada ola es diferente. Cada día en el mar es una lección nueva.", quote_eu: "Olatu bakoitza desberdina da. Itsasoan egun bakoitza ikasgai berria da.", author: "Proverbio marinero" },
    { id: 22, quote_es: "El horizonte siempre promete algo más allá.", quote_eu: "Horizonteak beti zerbait gehiago agintzen du harantzago.", author: "Proverbio marinero" },
    { id: 23, quote_es: "Quien nunca ha naufragado no puede presumir de buen marinero.", quote_eu: "Inoiz hondoratu ez dena ezin da marinel onaz harro egon.", author: "Proverbio marinero" },
    { id: 24, quote_es: "La libertad empieza donde terminan las amarras.", quote_eu: "Askatasuna amarrak amaitzen diren lekuan hasten da.", author: "Proverbio marinero" },
    { id: 25, quote_es: "Un barco es seguro en el puerto, pero no está hecho para quedarse ahí.", quote_eu: "Itsasontzia portuan seguru dago, baina ez dago han gelditzeko egina.", author: "Grace Hopper" },
    { id: 26, quote_es: "El mar enseña paciencia a los impacientes y humildad a los soberbios.", quote_eu: "Itsasoak pazientzia irakasten die pazientzia ez dutenei eta apaltasuna harroei.", author: "Proverbio marinero" },
    { id: 27, quote_es: "No puedes controlar el viento, pero puedes orientar tus velas.", quote_eu: "Ezin duzu haizea kontrolatu, baina zure belak zuzendu ditzakezu.", author: "Proverbio marinero" },
    { id: 28, quote_es: "La vida es como navegar: necesitas saber de dónde sopla el viento para llegar a tu destino.", quote_eu: "Bizitza nabigatzea bezalakoa da: jakin behar duzu nondik jotzen duen haizeak zure helmugara iristeko.", author: "Proverbio marinero" },
    { id: 29, quote_es: "El coraje no es la ausencia de miedo, sino la decisión de navegar a pesar de él.", quote_eu: "Ausardia ez da beldurraren gabezia, beldurraren gainetik nabigatzeko erabakia baizik.", author: "Proverbio marinero" },
    { id: 30, quote_es: "En la calma chicha es cuando el marinero prepara las velas para la tormenta.", quote_eu: "Barealdian prestatzen ditu marinelak belak ekaitzarako.", author: "Proverbio marinero" },
    { id: 31, quote_es: "La brújula no miente: el norte siempre está donde debe estar.", quote_eu: "Iparrorratza ez da gezurtia: iparraldea beti bere lekuan dago.", author: "Proverbio marinero" },
    { id: 32, quote_es: "No importa cuántas veces el mar te tire por la borda, sino cuántas veces vuelvas a subir.", quote_eu: "Ez du axola zenbat aldiz itsasoak borda gainetik bota zaitzun, zenbat aldiz igo zaren berriro baizik.", author: "Proverbio marinero" },
    { id: 33, quote_es: "La tripulación que rema junta, llega más lejos que el mejor remero en solitario.", quote_eu: "Elkarrekin arrasten duen tripulazioak arrapalari bakarrari baino urrunago iristen da.", author: "Proverbio marinero" },
    { id: 34, quote_es: "El amanecer en el mar tiene el poder de renovar cualquier espíritu.", quote_eu: "Itsasoko egunsentia edozein izpiritu berritzeko gai da.", author: "Proverbio marinero" },
    { id: 35, quote_es: "Cuando el viento de cambio sopla, algunos construyen muros y otros construyen barcos de vela.", quote_eu: "Aldaketaren haizea jotzen duenean, batzuek hesiak eraikitzen dituzte eta beste batzuek bela-ontziak.", author: "Proverbio chino" },
    { id: 36, quote_es: "La mar salada es el mejor antídoto contra la rutina.", quote_eu: "Itsaso gaziak errutinaren aurkako kontrakalte onena da.", author: "Proverbio marinero" },
    { id: 37, quote_es: "A cada nudo que aprendes, tu confianza crece como la marea.", quote_eu: "Ikasten duzun korapilo bakoitzarekin, zure konfiantza marea bezala hazten da.", author: "Proverbio marinero" },
    { id: 38, quote_es: "Los grandes navegantes no nacen: se forjan con kilómetros de estela.", quote_eu: "Nabigatzaile handiak ez dira jaiotzen: estelen kilometroekin lantzen dira.", author: "Proverbio marinero" },
    { id: 39, quote_es: "El mar no tiene caminos, pero el velero encuentra el suyo.", quote_eu: "Itsasoak ez du biderik, baina bela-ontziak berea aurkitzen du.", author: "Proverbio marinero" },
    { id: 40, quote_es: "Confía en el viento, pero nunca sueltes el timón.", quote_eu: "Fidatu haizeaz, baina ez utzi inoiz lemari.", author: "Proverbio marinero" },
    { id: 41, quote_es: "Un nudo bien hecho vale más que cien palabras.", quote_eu: "Ondo egindako korapilo batek ehun hitz baino gehiago balio du.", author: "Proverbio marinero" },
    { id: 42, quote_es: "El mejor momento para navegar fue ayer. El segundo mejor momento es hoy.", quote_eu: "Nabigatzeko momenturik onena atzo izan zen. Bigarren onena gaur da.", author: "Proverbio marinero" },
    { id: 43, quote_es: "Las estrellas guían al que sabe mirar hacia arriba.", quote_eu: "Izarrek gora begiratzen dakienari gidatzen diote.", author: "Proverbio marinero" },
    { id: 44, quote_es: "Despliega las velas al amanecer y deja que el día te sorprenda.", quote_eu: "Zabaldu belak egunsentiarekin eta utzi egunari zu harritzeari.", author: "Proverbio marinero" },
    { id: 45, quote_es: "La profesión de navegante es tan antigua como la curiosidad del ser humano.", quote_eu: "Nabigatzailearen lanbidea gizakiaren jakin-mina bezain zaharra da.", author: "Proverbio marinero" },
    { id: 46, quote_es: "El mar calma el alma y aviva los sueños.", quote_eu: "Itsasoak arima lasaitzen du eta ametsak pizten ditu.", author: "Proverbio marinero" },
    { id: 47, quote_es: "Quien aprende a navegar, aprende a vivir.", quote_eu: "Nabigatzen ikasten duenak bizitzen ikasten du.", author: "Proverbio marinero" },
    { id: 48, quote_es: "La marea sube y baja, pero el navegante siempre permanece.", quote_eu: "Marea igo eta jaisten da, baina nabigatzailea beti geratzen da.", author: "Proverbio marinero" },
    { id: 49, quote_es: "Más vale un rumbo imperfecto que la calma perpetua.", quote_eu: "Hobe norabide ezperfektua betiko baretasuna baino.", author: "Proverbio marinero" },
    { id: 50, quote_es: "En el mar, cada día es una página en blanco esperando ser escrita.", quote_eu: "Itsasoan, egun bakoitza idazteke dagoen orri zuri bat da.", author: "Proverbio marinero" },
];

/**
 * Returns the quote of the day based on the current date.
 * Deterministic: all users see the same quote on the same day.
 */
export function getDailyQuote(): NauticalQuote {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return nauticalQuotes[dayOfYear % nauticalQuotes.length];
}

export default nauticalQuotes;
