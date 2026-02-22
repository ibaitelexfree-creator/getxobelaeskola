import { describe, expect, it } from "vitest";
import { identifyFailedQuestions } from "./evaluation";

describe("identifyFailedQuestions", () => {
	it("should return empty array if all answers are correct", () => {
		const questions = [
			{ id: "q1", respuesta_correcta: "A" },
			{ id: "q2", respuesta_correcta: "true" },
		];
		const answers = {
			q1: "A",
			q2: "true",
		};
		expect(identifyFailedQuestions(questions, answers)).toEqual([]);
	});

	it("should identify wrong answers", () => {
		const questions = [
			{ id: "q1", respuesta_correcta: "A" },
			{ id: "q2", respuesta_correcta: "B" },
		];
		const answers = {
			q1: "A",
			q2: "C",
		};
		expect(identifyFailedQuestions(questions, answers)).toEqual(["q2"]);
	});

	it("should identify missing answers as wrong", () => {
		const questions = [{ id: "q1", respuesta_correcta: "A" }];
		const answers = {};
		expect(identifyFailedQuestions(questions, answers)).toEqual(["q1"]);
	});

	it("should handle type coercion (number to string)", () => {
		const questions = [{ id: "q1", respuesta_correcta: "10" }];
		const answers = { q1: 10 };
		expect(identifyFailedQuestions(questions, answers)).toEqual([]);
	});

	it("should handle type coercion (boolean to string)", () => {
		const questions = [{ id: "q1", respuesta_correcta: "true" }];
		const answers = { q1: true };
		expect(identifyFailedQuestions(questions, answers)).toEqual([]);
	});
});
