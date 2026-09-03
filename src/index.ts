import 'dotenv/config';
import { createApp } from './app/createApp.js';

const app = createApp();

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`FitMaster 2.0 started on port ${PORT}`);
    console.log(`Страница: http://localhost:3000/index.html`)
});