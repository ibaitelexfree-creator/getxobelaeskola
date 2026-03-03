import { beforeEach, describe, expect, it, vi } from "vitest";
import { processMarketingAutomations } from "./automation-service";

// Mock Dependencies
const { mockSupabase, mockResend, mockStripe } = vi.hoisted(() => {
	const mockSupabase = {
		from: vi.fn(),
		auth: {
			admin: {
				getUserById: vi.fn(),
			},
		},
	};

	const mockResend = {
		emails: {
			send: vi.fn(),
		},
	};

	const mockStripe = {
		promotionCodes: {
			create: vi.fn(),
		},
	};

	return { mockSupabase, mockResend, mockStripe };
});

vi.mock("../supabase/admin", () => ({
	createAdminClient: () => mockSupabase,
}));

vi.mock("../resend", () => ({
	resend: mockResend,
	DEFAULT_FROM_EMAIL: "test@example.com",
}));

vi.mock("../stripe", () => ({
	stripe: mockStripe,
}));

describe("processMarketingAutomations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Helper to create a chainable query builder
	const createQueryBuilder = (config: any = {}) => {
		const builder: any = {
			select: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			lte: vi.fn().mockReturnThis(),
			in: vi.fn().mockReturnThis(),
			maybeSingle: vi.fn(),
			insert: vi.fn().mockResolvedValue({ error: null }),
		};

		// Handle await directly on builder (for list results)
		builder.then = (resolve: any, _reject: any) => {
			if (config.error) {
				resolve({ data: null, error: config.error });
			} else if (config.count !== undefined) {
				resolve({ count: config.count, error: null });
			} else {
				resolve({ data: config.data || [], error: null });
			}
		};

		// Handle await on maybeSingle (for single results)
		builder.maybeSingle.mockImplementation(() => {
			if (config.singleError) {
				return Promise.resolve({ data: null, error: config.singleError });
			}
			return Promise.resolve({ data: config.singleData || null, error: null });
		});

		return builder;
	};

	const mockCampaign = {
		id: "camp_1",
		nombre: "Test Campaign",
		curso_trigger_id: "trigger_1",
		curso_objetivo_id: "target_1",
		dias_espera: 30,
		activo: true,
		trigger_course: { nombre_es: "Trigger Course" },
		target_course: { nombre_es: "Target Course", slug: "target-course" },
	};

	const mockInscription = {
		perfil_id: "user_1",
		created_at: "2023-01-01T00:00:00Z",
		profiles: { nombre: "Test User", email: "user@example.com" },
	};

	it("should process active campaigns successfully (Happy Path)", async () => {
		mockSupabase.from.mockImplementation((table: string) => {
			if (table === "marketing_campaigns") {
				return createQueryBuilder({ data: [mockCampaign] });
			}
			if (table === "inscripciones") {
				const builder = createQueryBuilder();
				builder.then = (resolve: any) => {
					if (builder.lte.mock.calls.length > 0) {
						resolve({ data: [mockInscription], error: null });
					} else if (builder.in.mock.calls.length > 0) {
						resolve({ data: [], error: null });
					} else {
						resolve({ data: [], error: null });
					}
				};
				return builder;
			}
			if (table === "marketing_history") {
				const builder = createQueryBuilder();
				builder.then = (resolve: any) => {
					if (builder.in.mock.calls.length > 0) {
						resolve({ data: [], error: null });
					} else {
						resolve({ data: null, error: null });
					}
				};
				return builder;
			}
			return createQueryBuilder();
		});

		mockResend.emails.send.mockResolvedValue({ id: "email_1" });

		const result = await processMarketingAutomations();

		expect(result.success).toBe(true);
		expect(result.totalSent).toBe(1);
		expect(mockResend.emails.send).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "user@example.com",
				subject: expect.stringContaining("Target Course"),
			}),
		);
	});

	it("should skip if user bought target course", async () => {
		mockSupabase.from.mockImplementation((table: string) => {
			if (table === "marketing_campaigns")
				return createQueryBuilder({ data: [mockCampaign] });
			if (table === "inscripciones") {
				const builder = createQueryBuilder();
				builder.then = (resolve: any) => {
					if (builder.lte.mock.calls.length > 0) {
						resolve({ data: [mockInscription], error: null });
					} else if (builder.in.mock.calls.length > 0) {
						resolve({ data: [{ perfil_id: "user_1" }], error: null });
					} else {
						resolve({ data: [], error: null });
					}
				};
				return builder;
			}
			if (table === "marketing_history") {
				const builder = createQueryBuilder();
				builder.then = (resolve: any) => {
					if (builder.in.mock.calls.length > 0) {
						resolve({ data: [], error: null });
					} else {
						resolve({ data: null, error: null });
					}
				};
				return builder;
			}
			return createQueryBuilder();
		});

		const result = await processMarketingAutomations();
		expect(result.totalSent).toBe(0);
		expect(mockResend.emails.send).not.toHaveBeenCalled();
	});

	it("should skip if campaign already sent", async () => {
		mockSupabase.from.mockImplementation((table: string) => {
			if (table === "marketing_campaigns")
				return createQueryBuilder({ data: [mockCampaign] });
			if (table === "inscripciones") {
				const builder = createQueryBuilder();
				builder.then = (resolve: any) => {
					if (builder.lte.mock.calls.length > 0) {
						resolve({ data: [mockInscription], error: null });
					} else {
						resolve({ data: [], error: null });
					}
				};
				return builder;
			}
			if (table === "marketing_history") {
				const builder = createQueryBuilder();
				builder.then = (resolve: any) => {
					if (builder.in.mock.calls.length > 0) {
						resolve({ data: [{ perfil_id: "user_1" }], error: null });
					} else {
						resolve({ data: null, error: null });
					}
				};
				return builder;
			}
			return createQueryBuilder();
		});

		const result = await processMarketingAutomations();
		expect(result.totalSent).toBe(0);
		expect(mockResend.emails.send).not.toHaveBeenCalled();
	});

	it("should fallback to static code on Stripe error", async () => {
		const campaignWithStripe = {
			...mockCampaign,
			stripe_coupon_id: "coupon_1",
			cupon_codigo: "STATIC10",
		};
		mockSupabase.from.mockImplementation((table: string) => {
			if (table === "marketing_campaigns")
				return createQueryBuilder({ data: [campaignWithStripe] });
			if (table === "inscripciones") {
				const builder = createQueryBuilder();
				builder.then = (resolve: any) => {
					if (builder.lte.mock.calls.length > 0)
						resolve({ data: [mockInscription], error: null });
					else resolve({ data: [], error: null });
				};
				return builder;
			}
			if (table === "marketing_history") {
				const builder = createQueryBuilder();
				builder.then = (resolve: any) => {
					if (builder.in.mock.calls.length > 0)
						resolve({ data: [], error: null });
					else resolve({ data: null, error: null });
				};
				return builder;
			}
			return createQueryBuilder();
		});

		mockStripe.promotionCodes.create.mockRejectedValue(
			new Error("Stripe Error"),
		);
		mockResend.emails.send.mockResolvedValue({ id: "email_1" });

		const result = await processMarketingAutomations();

		expect(result.totalSent).toBe(1);
		const emailHtml = mockResend.emails.send.mock.calls[0][0].html;
		expect(emailHtml).toContain("STATIC10");
	});

	it("should not insert history if email fails", async () => {
		const insertSpy = vi.fn().mockResolvedValue({ error: null });
		mockSupabase.from.mockImplementation((table: string) => {
			if (table === "marketing_campaigns")
				return createQueryBuilder({ data: [mockCampaign] });
			if (table === "inscripciones") {
				const builder = createQueryBuilder();
				builder.then = (resolve: any) => {
					if (builder.lte.mock.calls.length > 0)
						resolve({ data: [mockInscription], error: null });
					else resolve({ data: [], error: null });
				};
				return builder;
			}
			if (table === "marketing_history") {
				const builder = createQueryBuilder();
				builder.insert = insertSpy;
				builder.then = (resolve: any) => {
					if (builder.in.mock.calls.length > 0)
						resolve({ data: [], error: null });
					else resolve({ data: null, error: null });
				};
				return builder;
			}
			return createQueryBuilder();
		});

		mockResend.emails.send.mockRejectedValue(new Error("Email Error"));

		const result = await processMarketingAutomations();

		expect(result.totalSent).toBe(0);
		expect(insertSpy).not.toHaveBeenCalled();
	});
});
