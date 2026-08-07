/**
 * Static audit of notification / booking wiring (no live SMTP).
 * node scripts/audit-notify.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const checks = [];

function ok(name, pass, detail = '') {
  checks.push({ name, pass: !!pass, detail });
}

const appts = fs.readFileSync(path.join(root, 'src/routes/appointments.ts'), 'utf8');
const mail = fs.readFileSync(path.join(root, 'src/utils/mail.ts'), 'utf8');
const notify = fs.readFileSync(path.join(root, 'src/utils/bookingNotify.ts'), 'utf8');
const contact = fs.readFileSync(path.join(root, 'src/routes/contact.ts'), 'utf8');
const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf8');

ok('mail.ts exists', fs.existsSync(path.join(root, 'src/utils/mail.ts')));
ok('bookingNotify.ts exists', fs.existsSync(path.join(root, 'src/utils/bookingNotify.ts')));
ok('ClientNotifyPanel exists', fs.existsSync(path.join(root, '../admin/components/ClientNotifyPanel.tsx')));
ok('SMTP check in isMailConfigured', mail.includes('SMTP_HOST') && mail.includes('SMTP_PASS'));
ok('POST booking calls notifyBookingCreated', appts.includes('notifyBookingCreated'));
ok('PATCH status calls notifyStatusChange', appts.includes('notifyStatusChange'));
ok('POST /:id/notify resend endpoint', appts.includes("post('/:id/notify'"));
ok('GET notify-config before :id', (() => {
  const a = appts.indexOf("get('/notify-config'");
  const b = appts.indexOf("get('/:id'");
  return a > 0 && a < b;
})());
ok('contact form sends mail', contact.includes('notifyContactMessage'));
ok('schema has clientNotifyStatus', schema.includes('clientNotifyStatus'));
ok('persistClientNotify writes DB', notify.includes('clientNotifyStatus'));
ok('WhatsApp helper exists', notify.includes('buildClientWhatsAppUrl'));
ok('safeNotify timeout wrapper', notify.includes('safeNotify'));
ok('resend skips salon spam', notify.includes('skipSalon'));

const smtp =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
// SMTP is environment — warn only (code is fine without it)
checks.push({
  name: 'SMTP env present in this process',
  pass: true,
  warn: !smtp,
  detail: smtp ? 'configured' : 'WARN: NOT set — live mail will not send until Netlify/env SMTP_*',
});

console.log('\n=== Notification / booking audit ===\n');
let failed = 0;
let warns = 0;
for (const c of checks) {
  let mark = 'PASS';
  if (!c.pass) {
    mark = 'FAIL';
    failed++;
  } else if (c.warn) {
    mark = 'WARN';
    warns++;
  }
  console.log(`${mark.padEnd(4)}  ${c.name}${c.detail ? ' — ' + c.detail : ''}`);
}
console.log(`\n${checks.length - failed}/${checks.length} code checks ok · ${warns} env warning(s)`);
process.exit(failed ? 1 : 0);
