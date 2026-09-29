import type { Response } from "express";
import * as zod from "zod";

export function respondToHandlerError(handlerError: unknown, internalErrorMessage: string, httpResponse: Response) {
  if (handlerError instanceof zod.ZodError) {
    httpResponse.status(400).json({ error: "Invalid parameters", details: handlerError.errors });
    return;
  }
  console.error(handlerError);
  httpResponse.status(500).json({ error: internalErrorMessage });
}
