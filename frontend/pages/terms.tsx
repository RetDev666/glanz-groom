import Head from 'next/head';
import Layout from '@/components/Layout';

export default function TermsPage() {
  return (
    <Layout showFab={false}>
      <Head>
        <title>Загальні умови — Glanz & Groom</title>
        <meta name="description" content="Загальні умови надання послуг салону Glanz & Groom." />
      </Head>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-xl">
        <div className="mb-12 text-center md:text-left border-b border-surface-variant pb-8">
          <h1 className="font-display text-headline-xl text-on-surface mb-4">Загальні умови</h1>
          <p className="font-sans text-body-lg text-on-surface-variant">Чинні з: 1 січня 2024 року</p>
        </div>

        <article className="space-y-8">
          {[
            {
              icon: 'verified',
              num: '1',
              title: 'Сфера застосування',
              content: 'Ці Загальні умови (далі — «Умови») регулюють усі послуги, що надаються салоном Glanz & Groom. Актуальна версія Умов діє на момент запису на прийом.',
            },
            {
              icon: 'calendar_month',
              num: '2',
              title: 'Запис та скасування',
              content: 'Записи є обов\'язковими. Просимо скасовувати не менш ніж за 24 години. При скасуванні менш ніж за 24 години може стягуватись плата в розмірі 50% від вартості послуги. У разі неявки без попередження стягується повна вартість.',
              list: [
                'Скасування менш ніж за 24 год → 50% від вартості',
                'Неявка без попередження → 100% від вартості',
              ],
            },
            {
              icon: 'payments',
              num: '3',
              title: 'Ціни та оплата',
              content: 'Усі ціни зазначені в гривнях та включають ПДВ. Оплата здійснюється після надання послуги готівкою або карткою.',
            },
            {
              icon: 'health_and_safety',
              num: '4',
              title: 'Відповідальність та здоров\'я тварини',
              content: 'Власник запевняє, що тварина здорова, без інфекційних захворювань та паразитів. Відомі захворювання, алергії або особливості поведінки необхідно повідомити до початку процедури. Салон не несе відповідальності за шкоду через приховані проблеми зі здоров\'ям, якщо лише не було грубої недбалості з боку салону.',
            },
            {
              icon: 'lock',
              num: '5',
              title: 'Захист даних',
              content: 'Ми обробляємо персональні дані клієнтів лише для надання послуг. Дані не передаються третім сторонам без вашої згоди.',
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
