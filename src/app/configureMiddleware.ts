import express, { Express } from 'express';
import cors from 'cors';
import path from 'node:path';

export function configureMiddleware(app: Express) {

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(express.static(path.resolve('public')));
}