import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';

type TermSection = {
  icon: string;
  num: string;
  title: string;
  /** One or more paragraphs */
  paragraphs: string[];
};

const SECTIONS: TermSection[] = [
  {
    icon: 'verified',
    num: '1',
    title: 'Geltungsbereich',
    paragraphs: [
      'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Dienstleistungen des Salons Glanz & Groom. Die aktuelle Version der AGB ist zum Zeitpunkt der Terminbuchung gültig.',
    ],
  },
  {
    icon: 'schedule',
    num: '2',
    title: 'Verspätungen',
    paragraphs: [
      'Bei einer Verspätung von mehr als 15 Minuten behalten wir uns vor, die Behandlung zu verkürzen oder den Termin auf einen anderen Zeitpunkt zu verschieben, um einen reibungslosen Ablauf für alle Kunden gewährleisten zu können.',
    ],
  },
  {
    icon: 'event_busy',
    num: '3',
    title: 'Nichterscheinen',
    paragraphs: [
      'Bei einer Terminabsage weniger als 24 Stunden vor dem Termin oder bei Nichterscheinen ohne vorherige Absage (ausgenommen berechtigte Ausnahmefälle) behalten wir uns vor, 50 % des vereinbarten Behandlungspreises in Rechnung zu stellen. Bei wiederholtem Nichterscheinen kann für zukünftige Termine eine Vorauszahlung verlangt werden.',
    ],
  },
  {
    icon: 'health_and_safety',
    num: '4',
    title: 'Gesundheitszustand Ihres Hundes',
    paragraphs: [
      'Bitte informieren Sie uns vor dem Termin über gesundheitliche Einschränkungen, Allergien, ansteckende Krankheiten, Medikamente oder besondere Verhaltensweisen Ihres Hundes.',
    ],
  },
  {
    icon: 'timer',
    num: '5',
    title: 'Dauer der Behandlung',
    paragraphs: [
      'Die Dauer einer Behandlung richtet sich nach Fellzustand, Fellmenge, Verhalten des Hundes sowie dem tatsächlichen Pflegeaufwand. Die angegebenen Zeiten dienen lediglich als Orientierung.',
    ],
  },
  {
    icon: 'pets',
    num: '6',
    title: 'Wohl des Hundes',
    paragraphs: [
      'Das Wohlbefinden und die Sicherheit Ihres Hundes haben für uns oberste Priorität. Sollte eine Behandlung für den Hund mit erheblichem Stress oder einem gesundheitlichen Risiko verbunden sein, behalten wir uns das Recht vor, die Behandlung jederzeit abzubrechen oder anzupassen.',
    ],
  },
  {
    icon: 'photo_camera',
    num: '7',
    title: 'Foto- und Videoaufnahmen',
    paragraphs: [
      'Während des Aufenthalts Ihres Hundes bei Glanz & Groom können Foto- und Videoaufnahmen erstellt werden.',
      'Mit der Terminbuchung erklären Sie sich damit einverstanden, dass diese Aufnahmen auf unserer Website, in unseren Social-Media-Kanälen sowie für Werbe- und Marketingzwecke von Glanz & Groom verwendet werden dürfen.',
      'Sollten Sie keine Veröffentlichung wünschen, informieren Sie uns bitte vor Beginn des Termins.',
    ],
  },
  {
    icon: 'payments',
    num: '8',
    title: 'Preise',
    paragraphs: [
      'Unsere Preise richten sich nach Größe, Fellzustand, Fellpflegeaufwand, Verhalten des Hundes sowie der tatsächlich benötigten Behandlungszeit. Der endgültige Preis kann daher vom Grundpreis abweichen.',
    ],
  },
  {
    icon: 'lock',
    num: '9',
    title: 'Datenschutz',
    paragraphs: [
      'Der Schutz Ihrer personenbezogenen Daten ist uns sehr wichtig. Ihre Daten werden ausschließlich zur Terminverwaltung, Kundenbetreuung und zur Durchführung unserer Dienstleistungen verarbeitet und gemäß der Datenschutz-Grundverordnung (DSGVO) behandelt.',
      'Eine Weitergabe Ihrer personenbezogenen Daten an Dritte erfolgt ausschließlich, soweit dies gesetzlich vorgeschrieben oder zur Erfüllung unserer Leistungen erforderlich ist.',
      'Weitere Informationen finden Sie in unserer Datenschutzerklärung.',
    ],
  },
  {
    icon: 'gavel',
    num: '10',
    title: 'Haftung',
    paragraphs: [
      'Glanz & Groom übernimmt keine Haftung für Verletzungen, Erkrankungen oder gesundheitliche Beschwerden, die auf bereits bestehende Erkrankungen, gesundheitliche Einschränkungen oder Verhaltensauffälligkeiten des Hundes zurückzuführen sind.',
      'Sollten während der Behandlung bereits vorhandene Hautreizungen, Parasiten, Entzündungen, Verletzungen oder andere gesundheitliche Auffälligkeiten festgestellt werden, informieren wir Sie selbstverständlich umgehend.',
    ],
  },
  {
    icon: 'content_cut',
    num: '11',
    title: 'Verfilzungen',
    paragraphs: [
      'Bei stark verfilztem Fell oder ausgeprägten Verfilzungen kann zum Wohl des Hundes ein vollständiges oder teilweises Kürzen des Fells notwendig sein. Ein Ausbürsten stark verfilzter Stellen kann Schmerzen, Stress oder Verletzungen verursachen und wird daher aus Tierschutzgründen nicht durchgeführt.',
      'Die Entscheidung über die geeignete Pflegemethode erfolgt ausschließlich im Interesse der Gesundheit und des Wohlbefindens Ihres Hundes.',
    ],
  },
  {
    icon: 'bug_report',
    num: '12',
    title: 'Parasiten',
    paragraphs: [
      'Sollte bei Ihrem Hund während des Termins ein Befall mit Flöhen oder anderen ansteckenden Parasiten festgestellt werden, behalten wir uns vor, die Behandlung aus hygienischen Gründen abzubrechen oder einen zusätzlichen Reinigungs- und Desinfektionsaufwand in Rechnung zu stellen.',
      'Mit der Terminbuchung bestätigen Sie, dass Ihr Hund frei von ansteckenden Parasiten ist.',
    ],
  },
];

export default function TermsPage() {
  return (
    <Layout showFab={false}>
      <Head>
        <title>Allgemeine Geschäftsbedingungen — Glanz & Groom</title>
        <meta name="description" content="Allgemeine Geschäftsbedingungen für die Dienstleistungen des Salons Glanz & Groom." />
      </Head>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-xl">
        <div className="mb-12 text-center md:text-left border-b border-surface-variant pb-8">
          <h1 className="font-display text-headline-xl text-on-surface mb-4">Allgemeine Geschäftsbedingungen</h1>
          <p className="font-sans text-body-lg text-on-surface-variant">Gültig ab: 1. Januar 2024</p>
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
                  {section.num}. {section.title}
                </h2>
              </div>
              <div className="space-y-3">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="font-sans text-body-md text-on-surface-variant leading-relaxed">
                    {p}
                  </p>
                ))}
                {section.num === '9' && (
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
