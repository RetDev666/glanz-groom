import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';

type TermSection = {
  icon: string;
  num: string;
  title: string;
  paragraphs: string[];
  /** Optional bullet list after paragraphs */
  bullets?: string[];
  /** Optional paragraphs after the bullet list */
  afterBullets?: string[];
};

/**
 * AGB Glanz & Groom — Stand August 2026
 * Source: legal update (DDG / current salon policy).
 */
const SECTIONS: TermSection[] = [
  {
    icon: 'verified',
    num: '1',
    title: 'Geltungsbereich',
    paragraphs: [
      'Diese Allgemeinen Geschäftsbedingungen gelten für alle Dienstleistungen, die zwischen Glanz & Groom und seinen Kunden im Zusammenhang mit der Pflege und dem Grooming von Hunden vereinbart werden.',
      'Die AGB gelten insbesondere für Termine, die persönlich, telefonisch, per Nachricht oder über die Online-Terminbuchung auf unserer Website vereinbart werden.',
    ],
  },
  {
    icon: 'event_available',
    num: '2',
    title: 'Terminvereinbarung und Online-Buchung',
    paragraphs: [
      'Termine können persönlich, telefonisch, per Nachricht oder über unsere Website vereinbart werden.',
      'Bei der Online-Terminbuchung wählt der Kunde einen verfügbaren Termin sowie die gewünschte Leistung aus und übermittelt die Buchung über das dafür vorgesehene Buchungsformular.',
      'Mit Abschluss der Online-Buchung wird der ausgewählte Termin verbindlich reserviert.',
      'Der Kunde ist verpflichtet, bei der Buchung vollständige und zutreffende Angaben zu machen.',
      'Glanz & Groom behält sich vor, den Kunden zu kontaktieren, wenn zur gebuchten Leistung, zum Hund oder zum erforderlichen Zeitaufwand Rückfragen bestehen.',
    ],
  },
  {
    icon: 'health_and_safety',
    num: '3',
    title: 'Angaben zum Hund und Gesundheitszustand',
    paragraphs: [
      'Der Kunde verpflichtet sich, Glanz & Groom über alle bekannten Umstände zu informieren, die für die sichere Durchführung der Behandlung relevant sein können.',
      'Dazu gehören insbesondere Erkrankungen, Allergien, Hautprobleme, Verletzungen, Parasitenbefall, Medikamenteneinnahme sowie auffälliges, stark ängstliches oder aggressives Verhalten.',
      'Auch gesundheitliche Einschränkungen oder Probleme bei früheren Grooming-Behandlungen sollten vor Beginn der Behandlung mitgeteilt werden.',
    ],
  },
  {
    icon: 'pets',
    num: '4',
    title: 'Wohl und Sicherheit des Hundes',
    paragraphs: [
      'Das Wohlbefinden und die Sicherheit des Hundes stehen bei jeder Behandlung an erster Stelle.',
      'Sollte sich während der Behandlung herausstellen, dass die Fortsetzung der Behandlung mit erheblichen Schmerzen, starkem Stress oder einem gesundheitlichen Risiko für den Hund verbunden wäre, ist Glanz & Groom berechtigt, die Behandlung anzupassen, zu unterbrechen oder vorzeitig zu beenden.',
      'Bei einem akuten gesundheitlichen Notfall und wenn der Halter nicht rechtzeitig erreichbar ist, darf Glanz & Groom erforderliche tierärztliche Hilfe veranlassen.',
      'Notwendige Tierarztkosten trägt der Tierhalter, soweit Glanz & Groom den zugrunde liegenden Notfall nicht zu vertreten hat.',
    ],
  },
  {
    icon: 'content_cut',
    num: '5',
    title: 'Verfilzungen und Fellzustand',
    paragraphs: [
      'Bei stark verfilztem Fell kann es aus Gründen des Tierwohls erforderlich sein, einzelne Bereiche oder das Fell insgesamt deutlich kürzer zu schneiden oder zu scheren.',
      'Ein langwieriges oder für den Hund schmerzhaftes Ausbürsten starker Verfilzungen wird vermieden.',
      'Soweit möglich, wird ein erhebliches Abweichen von der ursprünglich gewünschten Frisur mit dem Kunden besprochen.',
      'Starke Verfilzungen oder ein außergewöhnlich pflegeintensiver Fellzustand können zu einem höheren Zeit- und Arbeitsaufwand und damit zu zusätzlichen Kosten führen.',
    ],
  },
  {
    icon: 'bug_report',
    num: '6',
    title: 'Parasiten',
    paragraphs: [
      'Hunde mit einem bekannten ansteckenden Parasitenbefall sollten nicht in den Salon gebracht werden.',
      'Wird während der Behandlung beispielsweise ein erheblicher Flohbefall oder ein anderer ansteckender Parasitenbefall festgestellt, kann Glanz & Groom die Behandlung aus hygienischen Gründen unterbrechen oder beenden.',
      'Zusätzlich erforderliche Reinigungs- und Desinfektionsmaßnahmen können entsprechend dem tatsächlich entstandenen Mehraufwand berechnet werden.',
    ],
  },
  {
    icon: 'payments',
    num: '7',
    title: 'Preise und zusätzlicher Aufwand',
    paragraphs: [
      'Die auf unserer Website angegebenen Preise sind, soweit entsprechend gekennzeichnet, Grund- bzw. Ab-Preise.',
      'Der tatsächliche Behandlungspreis richtet sich insbesondere nach:',
    ],
    bullets: [
      'Größe und Rasse des Hundes',
      'Fellmenge und Fellzustand',
      'vorhandenen Verfilzungen',
      'Verhalten des Hundes',
      'gewünschter Behandlung',
      'tatsächlichem Zeit- und Arbeitsaufwand',
    ],
    afterBullets: [
      'Entsteht ein erheblicher zusätzlicher Aufwand, der bei der Terminbuchung nicht vorhersehbar war und zu wesentlichen Mehrkosten führt, wird der Kunde soweit möglich vor Durchführung der zusätzlichen Arbeiten darüber informiert.',
    ],
  },
  {
    icon: 'schedule',
    num: '8',
    title: 'Verspätungen',
    paragraphs: [
      'Wir bitten unsere Kunden, pünktlich zum vereinbarten Termin zu erscheinen.',
      'Bei einer Verspätung von mehr als 15 Minuten kann die vollständige Durchführung der gebuchten Behandlung möglicherweise nicht mehr gewährleistet werden.',
      'Glanz & Groom behält sich in diesem Fall vor, die Behandlung anzupassen oder den Termin zu verschieben, wenn andernfalls nachfolgende Termine beeinträchtigt würden.',
    ],
  },
  {
    icon: 'event_busy',
    num: '9',
    title: 'Terminabsage und Nichterscheinen',
    paragraphs: [
      'Gebuchte Termine sind verbindlich.',
      'Kann ein Termin nicht wahrgenommen werden, bitten wir darum, diesen mindestens 24 Stunden vor dem vereinbarten Termin abzusagen.',
      'Bei einer Absage weniger als 24 Stunden vor dem Termin oder bei Nichterscheinen behalten wir uns vor, eine angemessene Ausfallentschädigung von bis zu 50 % des vereinbarten bzw. voraussichtlichen Behandlungspreises zu berechnen, sofern der reservierte Termin nicht anderweitig vergeben werden konnte.',
      'Dem Kunden bleibt ausdrücklich der Nachweis gestattet, dass Glanz & Groom kein Schaden oder ein wesentlich geringerer Schaden entstanden ist.',
      'Bei wiederholtem Nichterscheinen können zukünftige Terminbuchungen von einer angemessenen Vorauszahlung abhängig gemacht werden.',
    ],
  },
  {
    icon: 'photo_camera',
    num: '10',
    title: 'Foto- und Videoaufnahmen',
    paragraphs: [
      'Während oder nach der Behandlung können Foto- und Videoaufnahmen des Hundes erstellt werden.',
      'Eine Veröffentlichung dieser Aufnahmen auf unserer Website, unseren Social-Media-Kanälen oder zu sonstigen Werbezwecken erfolgt nur, wenn der Kunde hierfür eine entsprechende Einwilligung erteilt hat.',
      'Die Einwilligung ist freiwillig und kann jederzeit mit Wirkung für die Zukunft widerrufen werden.',
      'Die Erteilung oder Verweigerung der Einwilligung hat keinen Einfluss auf die Terminvergabe oder die Behandlung.',
    ],
  },
  {
    icon: 'dentistry',
    num: '11',
    title: 'Kosmetische Zahnreinigung',
    paragraphs: [
      'Die von Glanz & Groom angebotene kosmetische Zahnreinigung dient der kosmetischen Pflege und ersetzt keine tierärztliche Untersuchung, Diagnose oder Behandlung.',
      'Bei starkem Zahnstein, Zahnfleischentzündungen, Schmerzen, lockeren oder beschädigten Zähnen sowie anderen gesundheitlichen Auffälligkeiten empfehlen wir eine tierärztliche Abklärung.',
    ],
  },
  {
    icon: 'gavel',
    num: '12',
    title: 'Haftung',
    paragraphs: [
      'Glanz & Groom haftet nach den gesetzlichen Bestimmungen.',
      'Der Kunde ist verpflichtet, bekannte gesundheitliche Besonderheiten, Erkrankungen, Allergien und relevante Verhaltensauffälligkeiten des Hundes vor der Behandlung mitzuteilen.',
      'Für gesundheitliche Folgen, die ausschließlich auf nicht mitgeteilten und für Glanz & Groom nicht erkennbaren Umständen beruhen, richtet sich die Haftung nach den gesetzlichen Bestimmungen.',
    ],
  },
  {
    icon: 'lock',
    num: '13',
    title: 'Datenschutz',
    paragraphs: [
      'Personenbezogene Daten werden entsprechend den geltenden Datenschutzbestimmungen verarbeitet.',
      'Weitere Informationen befinden sich in unserer Datenschutzerklärung, die jederzeit über unsere Website abrufbar ist.',
    ],
  },
  {
    icon: 'balance',
    num: '14',
    title: 'Schlussbestimmungen',
    paragraphs: [
      'Es gilt das Recht der Bundesrepublik Deutschland unter Beachtung zwingender Verbraucherschutzvorschriften.',
      'Sollte eine einzelne Bestimmung dieser AGB unwirksam sein oder werden, richtet sich die Rechtsfolge nach den gesetzlichen Vorschriften. Die Wirksamkeit der übrigen Bestimmungen bleibt davon grundsätzlich unberührt.',
    ],
  },
];

export default function TermsPage() {
  return (
    <Layout showFab={false}>
      <Head>
        <title>Allgemeine Geschäftsbedingungen — Glanz & Groom</title>
        <meta
          name="description"
          content="Allgemeine Geschäftsbedingungen (AGB) von Glanz & Groom – Hundesalon Berlin. Stand August 2026."
        />
      </Head>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-xl">
        <div className="mb-12 text-center md:text-left border-b border-surface-variant pb-8">
          <h1 className="font-display text-headline-xl text-on-surface mb-4">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>
          <p className="font-sans text-body-lg text-on-surface font-semibold">Glanz & Groom – Hundesalon</p>
          <p className="font-sans text-body-md text-on-surface-variant mt-1">
            Kreuznacher Str. 10, 14197 Berlin
          </p>
          <p className="font-sans text-body-md text-on-surface-variant mt-2">Stand: August 2026</p>
        </div>

        <article className="space-y-8">
          {SECTIONS.map(section => (
            <section
              key={section.num}
              className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm border border-surface-variant"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">{section.icon}</span>
                <h2 className="font-display text-headline-lg text-on-surface">
                  § {section.num} {section.title}
                </h2>
              </div>
              <div className="space-y-3">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="font-sans text-body-md text-on-surface-variant leading-relaxed">
                    {p}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 font-sans text-body-md text-on-surface-variant">
                    {section.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
                {section.afterBullets?.map((p, i) => (
                  <p key={`ab-${i}`} className="font-sans text-body-md text-on-surface-variant leading-relaxed">
                    {p}
                  </p>
                ))}
                {section.num === '13' && (
                  <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">
                    <Link href="/datenschutz" className="text-primary underline underline-offset-2 hover:opacity-80">
                      Zur Datenschutzerklärung
                    </Link>
                    {' · '}
                    <Link href="/impressum" className="text-primary underline underline-offset-2 hover:opacity-80">
                      Impressum
                    </Link>
                  </p>
                )}
              </div>
            </section>
          ))}
        </article>
      </main>
    </Layout>
  );
}
