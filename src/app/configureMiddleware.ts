import express, { Express } from 'express';
import cors from 'cors';

export function configureMiddleware(app: Express) {

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
}