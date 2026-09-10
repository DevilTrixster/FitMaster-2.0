export class AppPattern {
    constructor(
        public readonly statusCode: number,
        public readonly name: string,
        public readonly message: string
    ) {}
}

export class AppStatus {
    // 2.x.x
    static readonly OK = new AppPattern(200, 'OK', 'Данные успешно получены');
    static readonly CREATED = new AppPattern(
        201,
        'CREATED',
        'Ресурс создан успешно'
    );
    static readonly NO_CONTENT = new AppPattern(
        204,
        'NO_CONTENT',
        'Операция успешно выполнена, но серверу нечего возвращать в теле ответа'
    );

    // 4.x.x
    static readonly BAD_REQUEST = new AppPattern(
        400,
        'BAD_REQUEST',
        'Запрос содержит ошибки, или не тот формат'
    );
    static readonly UNAUTHORIZED = new AppPattern(
        401,
        'UNAUTHORIZED',
        'Требуется аутентификация'
    );
    static readonly FORBIDDEN = new AppPattern(
        403,
        'FORBIDDEN',
        'Доступ запрещён'
    );
    static readonly NOT_FOUND = new AppPattern(
        404,
        'NOT_FOUND',
        'Запрошенный ресурс не найден'
    );
    static readonly CONFLICT = new AppPattern(
        409,
        'CONFLICT',
        'Запрос корректный, но его выполнение конфликтует с текущим состоянием ресурса'
    );
    static readonly UNPROCESSABLE_CONTENT = new AppPattern(
        422,
        'UNPROCESSABLE_CONTENT',
        'Структура и синтаксис запроса корректны, но содержимое не соответствует требованиям обработки'
    );

    // 5.x.x
    static readonly INTERNAL_SERVER_ERROR = new AppPattern(
        500,
        'INTERNAL_SERVER_ERROR',
        'Внутренняя ошибка сервера'
    );
    static readonly BAD_GATEWAY = new AppPattern(
        502,
        'BAD_GATEWAY',
        'Сервер получил некорректный ответ от другого сервера, с которым он взаимодействует'
    );
    static readonly SERVICE_UNAVAILABLE = new AppPattern(
        503,
        'SERVICE_UNAVAILABLE',
        'Сервис временно недоступен'
    );

    static findFromCode(code: number): AppPattern | undefined {
        const status = Object.values(AppStatus) as AppPattern[];
        return status.find((status) => status.statusCode === code);
    }

    static findFromName(name: string): AppPattern | undefined {
        const status = Object.values(AppStatus) as AppPattern[];
        return status.find((status) => status.name === name);
    }
}
