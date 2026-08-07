import type { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { fetchSettingsObject, mergeLegalSettings, type LegalSettings } from '@/lib/legalDefaults';

export async function getServerSideProps({ res }: { res: { setHeader: (k: string, v: string) => void } }) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  const raw = await fetchSettingsObject();
  return { props: { legal: mergeLegalSettings(raw) } };
}

export default function ImpressumPage({ legal }: { legal: LegalSettings }) {
  return (
    <Layout showFab={false}>
      <Head>
        <title>Impressum — Glanz & Groom</title>
        <meta
          name="description"
          content="Impressum und Anbieterkennzeichnung gemäß § 5 DDG / § 18 MStV für Glanz & Groom."
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-xl">
        <div className="mb-10 text-center md:text-left border-b border-surface-variant pb-8">
          <h1 className="font-display text-headline-xl text-on-surface mb-3">Impressum</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Angaben gemäß § 5 DDG
          </p>
        </div>

        <article className="space-y-6">
          <Section icon="store" title="Diensteanbieter">
            <p className="font-sans text-body-md text-on-surface font-semibold">{legal.ownerName}</p>
            {legal.legalForm && (
              <p className="font-sans text-body-md text-on-surface-variant">{legal.legalForm}</p>
            )}
            {legal.businessName && (
              <p className="font-sans text-body-md text-on-surface-variant">
                handelnd unter <strong className="text-on-surface">{legal.businessName}</strong>
              </p>
            )}
          </Section>

          <Section icon="location_on" title="Anschrift">
            <p className="font-sans text-body-md text-on-surface-variant whitespace-pre-line">
              {legal.address}
            </p>
          </Section>

          <Section icon="call" title="Kontakt">
            <ul className="space-y-2 font-sans text-body-md text-on-surface-variant">
              <li>
                <span className="text-on-surface font-medium">Telefon: </span>
                <a href={`tel:${legal.phone.replace(/\s/g, '')}`} className="text-primary hover:underline">
                  {legal.phone}
                </a>
              </li>
              <li>
                <span className="text-on-surface font-medium">E-Mail: </span>
                <a href={`mailto:${legal.email}`} className="text-primary hover:underline">
                  {legal.email}
                </a>
              </li>
            </ul>
          </Section>

          {legal.ustId ? (
            <Section icon="receipt_long" title="Umsatzsteuer-ID">
              <p className="font-sans text-body-md text-on-surface-variant">
                Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:{' '}
                <strong className="text-on-surface">{legal.ustId}</strong>
              </p>
            </Section>
          ) : null}

          {legal.wIdNr ? (
            <Section icon="badge" title="Wirtschafts-Identifikationsnummer">
              <p className="font-sans text-body-md text-on-surface-variant">
                Wirtschafts-Identifikationsnummer:{' '}
                <strong className="text-on-surface">{legal.wIdNr}</strong>
              </p>
            </Section>
          ) : null}

          <Section icon="gavel" title="Verantwortlich für journalistisch-redaktionelle Inhalte">
            <p className="font-sans text-body-md text-on-surface-variant">
              Verantwortlich für journalistisch-redaktionelle Inhalte gemäß § 18 Abs. 2 MStV, soweit vorhanden:{' '}
              <strong className="text-on-surface">{legal.ownerName}</strong>
            </p>
            <p className="font-sans text-body-md text-on-surface-variant mt-2 whitespace-pre-line">
              {legal.address}
            </p>
          </Section>

          <Section icon="policy" title="Haftung für externe Links">
            <div className="space-y-3 font-sans text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Unsere Website enthält gegebenenfalls Links zu externen Websites Dritter, auf deren Inhalte wir
                keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist der jeweilige Anbieter oder
                Betreiber verantwortlich.
              </p>
            </div>
          </Section>

          <Section icon="copyright" title="Urheberrecht">
            <div className="space-y-3 font-sans text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Die auf dieser Website erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Eine
                Vervielfältigung, Bearbeitung, Verbreitung oder sonstige Verwertung außerhalb der gesetzlichen
                Grenzen des Urheberrechts bedarf der vorherigen Zustimmung des jeweiligen Rechteinhabers.
              </p>
            </div>
          </Section>

          <div className="pt-4 flex flex-wrap gap-4 text-sm font-sans">
            <Link href="/datenschutz" className="text-primary underline underline-offset-2 hover:opacity-80">
              Datenschutzerklärung
            </Link>
            <Link href="/terms" className="text-primary underline underline-offset-2 hover:opacity-80">
              AGB
            </Link>
          </div>
        </article>
      </main>
    </Layout>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-sm border border-surface-variant">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
        <h2 className="font-display text-headline-md text-on-surface">{title}</h2>
      </div>
      {children}
    </section>
  );
}
