import { vi } from "vitest";
import { ref } from "vue";

export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: { full_name: "Test User" },
};

export const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: { access_token: "mock-token", user: mockUser } },
    }),
    onAuthStateChange: vi
      .fn()
      .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
};

export function mockAuth() {
  vi.mock("#imports", () => ({
    useSupabaseUser: () => ref(mockUser),
    useSupabaseClient: () => mockSupabaseClient,
    useRuntimeConfig: () => ({ public: {} }),
  }));
}
