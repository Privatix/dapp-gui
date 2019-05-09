export interface Log{
    time: string;
    level: string;
    message: string;
    context: {
        type: string;
        method: string;
    };
    stack: string;
}
