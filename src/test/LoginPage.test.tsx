import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import LoginPage from "@/pages/LoginPage";

function renderLoginPage() {
  return render(
    <HelmetProvider>
      <LoginPage />
    </HelmetProvider>
  );
}

async function submitForm() {
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
  });
}

describe("LoginPage redirect logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects an admin who is also a reseller to /admin, not /partner", async () => {
    mockLogin.mockResolvedValue({
      ok: true,
      isAdmin: true,
      isReseller: true,
    });

    renderLoginPage();
    await submitForm();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin", { replace: true });
      expect(mockNavigate).not.toHaveBeenCalledWith("/partner", expect.anything());
    });
  });

  it("redirects a reseller-only account to /partner", async () => {
    mockLogin.mockResolvedValue({
      ok: true,
      isAdmin: false,
      isReseller: true,
    });

    renderLoginPage();
    await submitForm();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/partner", { replace: true });
    });
  });

  it("redirects a standard user to /dashboard", async () => {
    mockLogin.mockResolvedValue({
      ok: true,
      isAdmin: false,
      isReseller: false,
    });

    renderLoginPage();
    await submitForm();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });
});
