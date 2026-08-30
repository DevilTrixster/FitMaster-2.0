import 'dotenv/config';
import { CreateApp } from './app/CreateApp.js';

const app = CreateApp();

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`FitMaster 2.0 started on port ${PORT}`);
    console.log(`Страница: http://localhost:3000/index.html`)
});