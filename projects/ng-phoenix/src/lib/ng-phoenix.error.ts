export class NgPhoenixError extends Error {
    constructor(type: string, msg: string, data?: object) {
        super(`${msg}\n${JSON.stringify(data)}`);
    }
}