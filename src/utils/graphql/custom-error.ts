import { GraphQLFormattedError, GraphQLError } from "graphql";

export default class CustomError extends GraphQLError {
    code: string;

    constructor(message: string, code = "CUSTOM_ERROR") {
        super(message);
        this.code = code;
        Object.defineProperty(this, "name", { value: "CustomError" });
    }
}

export const handleError = (formattedError: GraphQLFormattedError, error: unknown) => {
    if (formattedError.message.startsWith("Database Error: ")) {
        return { message: "Internal server error" };
    }

    if (error instanceof CustomError) {
        return { message: error.message };
    }

    return formattedError;
};
