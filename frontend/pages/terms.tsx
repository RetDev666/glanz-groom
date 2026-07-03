import Head from 'next/head';
import Layout from '@/components/Layout';

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
          {[
            {
              icon: 'verified',
              num: '1',
              title: 'Geltungsbereich',
              content: 'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Dienstleistungen des Salons Glanz & Groom. Die aktuelle Version der AGB ist zum Zeitpunkt der Terminbuchung gültig.',
            },
            {
              icon: 'calendar_month',
              num: '2',
              title: 'Terminbuchung und Absage',
              content: 'Terminbuchungen sind verbindlich. Ich erkläre mich damit einverstanden, dass eine Terminabsage nur bis spätestens 24 Stunden vor dem Termin kostenlos möglich ist. Bei einer späteren Absage oder bei Nichterscheinen verpflichte ich mich, 50 % der Kosten des gebuchten Termins zu bezahlen.',
              list: [
                'Absage weniger als 24 Stunden vorher → 50% der Kosten',
                'Nichterscheinen ohne Absage → 50% bis 100% der Kosten',
              ],
            },
            {
              icon: 'payments',
              num: '3',
              title: 'Preise und Zahlung',
              content: 'Alle Preise verstehen sich in Euro und beinhalten die gesetzliche Mehrwertsteuer. Die Zahlung erfolgt nach Erbringung der Dienstleistung in bar oder per Karte.',
            },
            {
              icon: 'health_and_safety',
              num: '4',
              title: 'Haftung und Gesundheit des Tieres',
              content: 'Der Besitzer versichert, dass das Tier gesund, frei von ansteckenden Krankheiten und Parasiten ist. Bekannte Krankheiten, Allergien oder Verhaltensauffälligkeiten müssen vor Beginn der Behandlung mitgeteilt werden. Der Salon haftet nicht für Schäden aufgrund versteckter gesundheitlicher Probleme, es sei denn, es liegt grobe Fahrlässigkeit seitens des Salons vor.',
            },
            {
              icon: 'lock',
              num: '5',
              title: 'Datenschutz',
              content: 'Wir verarbeiten die personenbezogenen Daten der Kunden nur zur Erbringung der Dienstleistungen. Die Daten werden ohne Ihre Zustimmung nicht an Dritte weitergegeben.',
            },
          ].map(section => (
            <section key={section.num} className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm border border-surface-variant">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">{section.icon}</span>
                <h2 className="font-display text-headline-lg text-on-surface">{section.num}. {section.title}</h2>
              </div>
              <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">{section.content}</p>
              {section.list && (
                <ul className="mt-3 list-disc pl-6 space-y-1 font-sans text-body-md text-on-surface-variant">
                  {section.list.map(item => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </article>
      </main>
    </Layout>
  );
}
