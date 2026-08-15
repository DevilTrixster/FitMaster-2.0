import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'FitMaster 2.0'
    });
});

app.listen(PORT, () => {
    console.log(`FitMaster 2.0 started on port ${PORT}`);
});