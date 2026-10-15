import type { Response } from "express";

import { getPrice } from "@/application/usecases/getPrice.js";

export async function getPriceHandler(httpResponse: Response) {
  try {
    httpResponse.json(await getPrice());
  } catch {
    httpResponse.status(503).json({ error: "Price data unavailable" });
  }
}
