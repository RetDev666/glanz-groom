import serverless from 'serverless-http';
import app from '../../backend/src/index';

// Загортаємо весь Express додаток у Netlify Function.
// Всі маршрути /api/* обробляються тут.
export const handler = serverless(app);
