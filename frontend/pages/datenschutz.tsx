import type { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { openCookieSettings } from '@/components/CookieConsent';
import { fetchSettingsObject, mergeLegalSettings, type LegalSettings } from '@/lib/legalDefaults';

export async function getServerSideProps({ res }: { res: { setHeader: (k: string, v: string) => void } }) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  const raw = await fetchSettingsObject();
  return { props: { legal: mergeLegalSettings(raw) } };
}

export default function DatenschutzPage({ legal }: { legal: LegalSettings }) {
  const hasGa = legal.analyticsEnabled && !!legal.googleAnalyticsId;
  const hasPixel = legal.marketingEnabled && !!legal.metaPixelId;

  return (
    <Layout showFab={false}>
      <Head>
        <title>Datenschutzerklärung — Glanz & Groom</title>
        <meta
          name="description"
          content="Datenschutzerklärung von Glanz & Groom gemäß DSGVO und TTDSG."
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-xl">
        <div className="mb-10 text-center md:text-left border-b border-surface-variant pb-8">
          <h1 className="font-display text-headline-xl text-on-surface mb-3">Datenschutzerklärung</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <article className="space-y-6">
          <Section icon="person" title="1. Verantwortlicher">
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der
              Datenschutz-Grundverordnung (DSGVO) ist:
            </p>
            <div className="mt-3 p-4 bg-surface-container-low rounded-xl font-sans text-body-md text-on-surface space-y-1">
              <p className="font-semibold">{legal.ownerName}</p>
              {legal.legalForm && <p className="text-on-surface-variant">{legal.legalForm}</p>}
              <p className="text-on-surface-variant">{legal.businessName}</p>
              <p className="text-on-surface-variant whitespace-pre-line">{legal.address}</p>
              <p className="text-on-surface-variant">
                Telefon:{' '}
                <a href={`tel:${legal.phone.replace(/\s/g, '')}`} className="text-primary hover:underline">
                  {legal.phone}
                </a>
              </p>
              <p className="text-on-surface-variant">
                E-Mail:{' '}
                <a href={`mailto:${legal.email}`} className="text-primary hover:underline">
                  {legal.email}
                </a>
              </p>
            </div>
            <p className="mt-3 text-body-md text-on-surface-variant leading-relaxed">
              Weitere Angaben finden Sie im{' '}
              <Link href="/impressum" className="text-primary underline underline-offset-2">
                Impressum
              </Link>
              .
            </p>
          </Section>

          <Section icon="info" title="2. Allgemeine Hinweise zur Datenverarbeitung">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Wir verarbeiten personenbezogene
                Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website, unserer Inhalte und
                Leistungen sowie zur Terminverwaltung erforderlich ist oder Sie eingewilligt haben.
              </p>
              <p>
                Rechtsgrundlagen der Verarbeitung sind insbesondere Art. 6 Abs. 1 lit. a DSGVO (Einwilligung),
                Art. 6 Abs. 1 lit. b DSGVO (Vertrag / vorvertragliche Maßnahmen) und Art. 6 Abs. 1 lit. f DSGVO
                (berechtigtes Interesse).
              </p>
              <p>
                Personenbezogene Daten werden gelöscht, sobald der Zweck der Speicherung entfällt und keine
                gesetzlichen Aufbewahrungsfristen entgegenstehen.
              </p>
            </div>
          </Section>

          <Section icon="dns" title="3. Hosting">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Diese Website wird bei folgendem Anbieter gehostet:
              </p>
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="font-semibold text-on-surface">{legal.hostingProvider}</p>
                <p>{legal.hostingAddress}</p>
                <a
                  href={legal.hostingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {legal.hostingUrl}
                </a>
              </div>
              <p>
                Beim Besuch der Website werden durch den Hosting-Anbieter Server-Logfiles verarbeitet
                (u. a. IP-Adresse, Datum und Uhrzeit der Anfrage, Browsertyp, Referrer-URL). Die Verarbeitung
                erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer
                sicheren und stabilen Bereitstellung der Website).
              </p>
              <p>
                Soweit der Anbieter in den USA ansässig ist, kann eine Übermittlung in Drittländer erfolgen.
                Netlify stützt sich dabei u. a. auf Standardvertragsklauseln (SCC) und weitere geeignete
                Garantien gemäß Art. 46 DSGVO.
              </p>
              <p>
                Für die Speicherung von Bildern (z. B. Portfolio, Haustierfotos bei der Buchung) nutzen wir
                Cloudinary. Für die Datenbank wird ein cloudbasierter SQLite-Dienst (Turso / libSQL) eingesetzt.
                Beide verarbeiten technische und ggf. von Ihnen übermittelte Daten ausschließlich im Rahmen
                der jeweiligen Auftragsverarbeitung.
              </p>
            </div>
          </Section>

          <Section icon="cookie" title="4. Cookies und Einwilligung">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Unsere Website verwendet Cookies und ähnliche Technologien. Technisch notwendige Cookies sind
                für den Betrieb der Website erforderlich (Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TTDSG i. V. m.
                Art. 6 Abs. 1 lit. f DSGVO).
              </p>
              <p>
                Optionale Cookies (Funktional, Analyse, Marketing) setzen wir nur, wenn Sie über unser
                Cookie-Banner ausdrücklich eingewilligt haben (§ 25 Abs. 1 TTDSG, Art. 6 Abs. 1 lit. a DSGVO).
                Ihre Entscheidung speichern wir in einem First-Party-Cookie{' '}
                <code className="text-xs bg-surface-container px-1.5 py-0.5 rounded">gg_cookie_consent</code>{' '}
                mit den Attributen <strong>SameSite=Lax</strong>, <strong>Secure</strong> (bei HTTPS) und
                einer Gültigkeit von 12 Monaten. Der Inhalt ist eine JSON-Struktur mit den gewählten
                Kategorien und einem Versionsstand der Einwilligung.
              </p>
              <p>
                Sie können Ihre Einwilligung jederzeit widerrufen oder anpassen:
              </p>
              <button
                type="button"
                onClick={() => openCookieSettings()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-on-primary font-sans text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Cookie-Einstellungen öffnen
              </button>
            </div>
          </Section>

          <Section icon="mail" title="5. Kontaktformular">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Wenn Sie uns über das Kontaktformular auf der Seite „Über uns“ schreiben, verarbeiten wir die
                von Ihnen angegebenen Daten (Name, E-Mail-Adresse, Betreff, Nachricht), um Ihre Anfrage zu
                bearbeiten und zu beantworten.
              </p>
              <p>
                <strong className="text-on-surface">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
                (vorvertragliche Maßnahmen / Vertragsanbahnung) bzw. Art. 6 Abs. 1 lit. f DSGVO
                (berechtigtes Interesse an der Beantwortung von Anfragen).
              </p>
              <p>
                Die Daten werden gespeichert, solange dies zur Bearbeitung erforderlich ist, und
                anschließend gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
              </p>
            </div>
          </Section>

          <Section icon="event" title="6. Online-Terminbuchung">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Über unser eigenes Buchungssystem (kein Calendly oder vergleichbarer Drittanbieter) können
                Sie Termine online anfragen. Dabei verarbeiten wir insbesondere:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name, Telefonnummer, E-Mail-Adresse</li>
                <li>Angaben zum Haustier (Name, Rasse, Größe, optional Foto)</li>
                <li>gewünschte Leistungen, Datum/Uhrzeit, Freitext-Hinweise</li>
              </ul>
              <p>
                <strong className="text-on-surface">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
                (Erfüllung bzw. Anbahnung eines Dienstleistungsvertrags).
              </p>
              <p>
                Die Daten dienen der Terminplanung, Kundenbetreuung und Leistungserbringung und werden
                entsprechend gesetzlicher und betrieblicher Aufbewahrungsfristen gespeichert.
              </p>
            </div>
          </Section>

          <Section icon="map" title="7. Google Maps">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Auf unserer Website verlinken wir auf Google Maps (Google Ireland Limited, Gordon House,
                Barrow Street, Dublin 4, Irland), um unseren Standort anzuzeigen. Beim Klick auf den Link
                werden Sie zu den Servern von Google weitergeleitet. Dabei können personenbezogene Daten
                (u. a. IP-Adresse) an Google übertragen werden.
              </p>
              <p>
                Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an
                einer ansprechenden Darstellung unseres Standorts). Weitere Informationen:{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Google Datenschutzerklärung
                </a>
                .
              </p>
              {legal.mapsUrl && (
                <p>
                  Unser Standort-Link:{' '}
                  <a
                    href={legal.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 break-all"
                  >
                    Google Maps
                  </a>
                </p>
              )}
            </div>
          </Section>

          <Section icon="photo_camera" title="8. Instagram">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Wir unterhalten eine Präsenz auf Instagram (Meta Platforms Ireland Limited, 4 Grand Canal
                Square, Grand Canal Harbour, Dublin 2, Irland). Verlinkungen von unserer Website zu Instagram
                führen zu einer Verarbeitung durch Meta, sobald Sie die externe Seite öffnen.
              </p>
              <p>
                Rechtsgrundlage für die Verlinkung ist Art. 6 Abs. 1 lit. f DSGVO. Weitere Informationen zur
                Datenverarbeitung durch Meta/Instagram finden Sie in der{' '}
                <a
                  href="https://privacycenter.instagram.com/policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Instagram-Datenschutzrichtlinie
                </a>
                .
              </p>
              {legal.instagramUrl && (
                <p>
                  Unser Profil:{' '}
                  <a
                    href={legal.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    {legal.instagramHandle || legal.instagramUrl}
                  </a>
                </p>
              )}
            </div>
          </Section>

          <Section icon="font_download" title="9. Google Fonts">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              <p>
                Zur einheitlichen Darstellung von Schriftarten laden wir Google Fonts und Material Symbols
                von Servern der Google Ireland Limited. Beim Aufruf der Website stellt Ihr Browser eine
                Verbindung zu Google her; dabei kann Ihre IP-Adresse übermittelt werden.
              </p>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer technisch
                stabilen und einheitlichen Darstellung). Details:{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  Google Privacy Policy
                </a>
                .
              </p>
            </div>
          </Section>

          <Section icon="analytics" title="10. Google Analytics">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              {hasGa ? (
                <>
                  <p>
                    Sofern Sie der Kategorie „Analyse“ im Cookie-Banner zugestimmt haben, setzen wir Google
                    Analytics (Google Ireland Limited) ein. Die Mess-ID lautet:{' '}
                    <code className="text-xs bg-surface-container px-1.5 py-0.5 rounded">
                      {legal.googleAnalyticsId}
                    </code>
                    . IP-Adressen werden anonymisiert verarbeitet, soweit technisch möglich.
                  </p>
                  <p>
                    Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TTDSG. Sie können die
                    Einwilligung jederzeit über die Cookie-Einstellungen widerrufen.
                  </p>
                </>
              ) : (
                <p>
                  Google Analytics ist derzeit <strong className="text-on-surface">nicht aktiv</strong> bzw.
                  wird erst nach Ihrer Einwilligung und entsprechender Konfiguration im Administrationsbereich
                  geladen. Ohne Einwilligung werden keine Analyse-Cookies gesetzt und kein Tracking-Skript
                  geladen.
                </p>
              )}
            </div>
          </Section>

          <Section icon="campaign" title="11. Meta Pixel (Facebook Pixel)">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              {hasPixel ? (
                <>
                  <p>
                    Sofern Sie der Kategorie „Marketing“ zugestimmt haben, kann der Meta-Pixel (Meta Platforms
                    Ireland Limited) geladen werden. Pixel-ID:{' '}
                    <code className="text-xs bg-surface-container px-1.5 py-0.5 rounded">
                      {legal.metaPixelId}
                    </code>
                    .
                  </p>
                  <p>
                    Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TTDSG. Widerruf über die
                    Cookie-Einstellungen möglich.
                  </p>
                </>
              ) : (
                <p>
                  Der Meta Pixel ist derzeit <strong className="text-on-surface">nicht aktiv</strong>. Er wird
                  nur geladen, wenn er im Administrationsbereich konfiguriert ist und Sie der Kategorie
                  „Marketing“ zugestimmt haben.
                </p>
              )}
            </div>
          </Section>

          <Section icon="event_available" title="12. Calendly und vergleichbare Buchungsservices">
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Wir nutzen <strong className="text-on-surface">keinen</strong> externen Termin-Service wie
              Calendly. Die Online-Buchung erfolgt über unser eigenes System (siehe Abschnitt 6). Sollte sich
              dies ändern, wird diese Datenschutzerklärung entsprechend aktualisiert.
            </p>
          </Section>

          <Section icon="security" title="13. Ihre Rechte">
            <div className="space-y-3 text-body-md text-on-surface-variant leading-relaxed">
              <p>Sie haben gegenüber dem Verantwortlichen insbesondere folgende Rechte:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Auskunft (Art. 15 DSGVO)</li>
                <li>Berichtigung (Art. 16 DSGVO)</li>
                <li>Löschung (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruch (Art. 21 DSGVO)</li>
                <li>Widerruf einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
              </ul>
              <p>
                Zur Ausübung Ihrer Rechte genügt eine formlose Mitteilung an{' '}
                <a href={`mailto:${legal.email}`} className="text-primary underline underline-offset-2">
                  {legal.email}
                </a>
                .
              </p>
              <p>
                Zudem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren,
                insbesondere bei der für Ihren Wohnsitz zuständigen Behörde (Art. 77 DSGVO). Für Berlin:
                Berliner Beauftragte für Datenschutz und Informationsfreiheit.
              </p>
            </div>
          </Section>

          <Section icon="update" title="14. Aktualität">
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
              rechtlichen Anforderungen entspricht oder Änderungen unserer Leistungen abbildet. Für Ihren
              erneuten Besuch gilt jeweils die aktuelle Fassung.
            </p>
          </Section>

          <div className="pt-4 flex flex-wrap gap-4 text-sm font-sans">
            <Link href="/impressum" className="text-primary underline underline-offset-2 hover:opacity-80">
              Impressum
            </Link>
            <Link href="/terms" className="text-primary underline underline-offset-2 hover:opacity-80">
              AGB
            </Link>
            <button
              type="button"
              onClick={() => openCookieSettings()}
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              Cookie-Einstellungen
            </button>
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
        <h2 className="font-display text-lg md:text-xl font-bold text-on-surface">{title}</h2>
      </div>
      <div className="font-sans">{children}</div>
    </section>
  );
}
