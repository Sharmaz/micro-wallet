import type { Response } from "express";
import { vi } from "vitest";

export function createMockHttpResponse() {
  const mockHttpResponse = {
    json: vi.fn(),
    status: vi.fn(),
  } as unknown as Response;
  (mockHttpResponse.status as ReturnType<typeof vi.fn>).mockReturnValue(mockHttpResponse);
  return mockHttpResponse;
}
