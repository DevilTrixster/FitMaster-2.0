export class StatusTemplate {
    constructor(
        public readonly statusCode: number,
        public readonly synonym: string,
        public readonly message: string
    ) {}
}
