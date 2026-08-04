import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import LandingPage from "@/app/page";

describe("LandingPage", () => {
  it("renders the nav with logo and primary links", () => {
    render(<LandingPage />);

    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(within(nav).getByText("EscrowFlow")).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /how it works/i })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /features/i })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /faq/i })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /open app/i })).toHaveAttribute("href", "/app/login");
  });

  it("renders the hero headline and CTAs", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /get paid safely for work, anywhere in the world/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /open app/i }).length).toBeGreaterThan(0);
  });
});
