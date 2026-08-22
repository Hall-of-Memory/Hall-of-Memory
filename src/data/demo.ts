export const demoOffers = [
  {
    id: 'fotobox',
    title: 'Fotobox',
    kicker: 'Spontan & nahbar',
    description:
      'Ein eigener Fotomoment für Gäste, Gruppen und kleine Geschichten – klar präsentiert und direkt anfragbar.',
    moreInfo:
      'Die Fotobox schafft einen unkomplizierten Ort für spontane Gruppenbilder und persönliche Erinnerungen. Details und gewünschter Rahmen werden passend zum Anlass abgestimmt.',
    motif: 'flash',
    highlights: ['Für Eventmomente', 'Persönlich abstimmbar', 'Eigene Galerie danach'],
  },
  {
    id: 'fotospiegel',
    title: 'Fotospiegel',
    kicker: 'Elegant & präsent',
    description:
      'Ein raumprägendes Fotoerlebnis mit einer besonders eleganten Präsenz für den Anlass.',
    moreInfo:
      'Der Fotospiegel verbindet das Fotoerlebnis mit einer präsenten, eleganten Inszenierung. Die konkrete Ausgestaltung wird persönlich auf Veranstaltung und Umgebung abgestimmt.',
    motif: 'mirror',
    highlights: ['Präsente Inszenierung', 'Persönlich abstimmbar', 'Eigene Galerie danach'],
  },
  {
    id: 'magazinbox',
    title: 'Magazinbox',
    kicker: 'Editorial & besonders',
    description:
      'Ein inszenierter Fotomoment mit Magazincharakter, bei dem Gäste selbst zum Motiv werden.',
    moreInfo:
      'Die Magazinbox setzt Gäste bewusst in Szene und verbindet den gemeinsamen Fotomoment mit einem klaren Magazincharakter. Einzelheiten werden passend zum Anlass abgestimmt.',
    motif: 'editorial',
    highlights: ['Magazin-Look', 'Persönlich abstimmbar', 'Eigene Galerie danach'],
  },
] as const;

export const demoPackages = [
  {
    id: 'beratung',
    name: 'Beratung / Paket gemeinsam auswählen',
  },
] as const;

export const demoBenefits = [
  {
    title: 'Erlebnis zuerst',
    text: 'Die Angebote werden nicht nur erklärt, sondern als Teil des Events inszeniert.',
  },
  {
    title: 'Persönlich planbar',
    text: 'Produkt, Paket und Rahmen werden über eine klare Anfrage gemeinsam abgestimmt.',
  },
  {
    title: 'Bilder danach',
    text: 'Nach dem Event führt dein geschützter persönlicher Zugang direkt zu den Bildern deiner Veranstaltung.',
  },
  {
    title: 'Offen für mehr',
    text: 'Neben den drei aktuellen Erlebnissen kann Hall of Memory das Angebot später um weitere Event-Ideen ergänzen.',
  },
] as const;

export const demoSteps = [
  {
    number: '01',
    title: 'Erlebnis wählen',
    text: 'Fotobox, Fotospiegel, Magazinbox oder später ein weiteres Event-Angebot auswählen.',
  },
  {
    number: '02',
    title: 'Anfrage senden',
    text: 'Datum, Ort, Veranstaltungsart, Produkt, Paket und Kontaktdaten übermitteln.',
  },
  {
    number: '03',
    title: 'Details abstimmen',
    text: 'Der konkrete Leistungsrahmen wird persönlich für den Anlass abgestimmt.',
  },
  {
    number: '04',
    title: 'Erinnerungen wiedersehen',
    text: 'Nach der Veranstaltung führt der persönliche Zugang ausschließlich zur eigenen Galerie.',
  },
] as const;

export const demoFaqs = [
  {
    question: 'Welche Event-Angebote gibt es aktuell?',
    answer:
      'Zum Start stehen Fotobox, Fotospiegel und Magazinbox im Mittelpunkt. Weitere Event-Erlebnisse können das Angebot später ergänzen.',
  },
  {
    question: 'Wie stelle ich eine Anfrage?',
    answer:
      'Im Anfrageformular werden gewünschtes Produkt, Paket, Veranstaltungsdatum, Ort, Veranstaltungsart und Kontaktdaten zusammengeführt. Eine Anfrage ist noch keine verbindliche Buchung.',
  },
  {
    question: 'Wie erhalte ich nach dem Event meine Bilder?',
    answer:
      'Vorgesehen ist ein geschützter persönlicher Link oder Code. Der Zugriff wird pro Veranstaltung getrennt, sodass ausschließlich die eigene Galerie erreichbar ist.',
  },
  {
    question: 'Kann ich direkt ein Paket auswählen?',
    answer:
      'Die konkreten Paketvarianten werden nach Freigabe mit Leistungen und Preisen vergleichbar angeboten. Bis dahin wählen wir das passende Paket im Anfrageweg gemeinsam aus.',
  },
] as const;
