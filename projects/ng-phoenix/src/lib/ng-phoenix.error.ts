export class NgPhoenixError extends Error {
    constructor(type: string, msg: string, data?: object) {
        const finalMsg = `${msg}` + (!!data ? `\n${JSON.stringify(data)}` : "");
        super(finalMsg);
    }
}