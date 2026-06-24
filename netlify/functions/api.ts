import serverless from 'serverless-http';
import app from '../../backend/src/index';

// Обгортка для перехоплення помилок ініціалізації
let handlerFunction: any;
try {
  handlerFunction = serverless(app);
} catch (error: any) {
  console.error("Failed to initialize serverless function:", error);
  handlerFunction = async (event: any, context: any) => {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error during initialization", details: error?.message || String(error) })
    };
  };
}

export const handler = async (event: any, context: any) => {
  try {
    return await handlerFunction(event, context);
  } catch (error: any) {
    console.error("Runtime error in serverless function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Runtime Error", details: error?.message || String(error) })
    };
  }
};
