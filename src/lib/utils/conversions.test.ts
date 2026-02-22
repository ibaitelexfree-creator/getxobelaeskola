import { describe, expect, it } from "vitest";
import {
	celsiusToFahrenheit,
	fahrenheitToCelsius,
	fathomsToMeters,
	feetToMeters,
	hpaToInHg,
	inHgToHpa,
	kmhToKnots,
	kmToNauticalMiles,
	knotsToKmh,
	knotsToMs,
	metersToFathoms,
	metersToFeet,
	msToKnots,
	nauticalMilesToKm,
} from "./conversions";

describe("Nautical Conversions", () => {
	// Speed
	it("should convert knots to km/h correctly", () => {
		expect(knotsToKmh(1)).toBeCloseTo(1.852);
		expect(knotsToKmh(10)).toBeCloseTo(18.52);
	});

	it("should convert km/h to knots correctly", () => {
		expect(kmhToKnots(1.852)).toBeCloseTo(1);
		expect(kmhToKnots(18.52)).toBeCloseTo(10);
	});

	it("should convert knots to m/s correctly", () => {
		expect(knotsToMs(1)).toBeCloseTo(0.514444);
	});

	it("should convert m/s to knots correctly", () => {
		expect(msToKnots(0.514444)).toBeCloseTo(1);
	});

	// Distance
	it("should convert feet to meters correctly", () => {
		expect(feetToMeters(1)).toBeCloseTo(0.3048);
		expect(feetToMeters(10)).toBeCloseTo(3.048);
	});

	it("should convert meters to feet correctly", () => {
		expect(metersToFeet(0.3048)).toBeCloseTo(1);
	});

	it("should convert nautical miles to km correctly", () => {
		expect(nauticalMilesToKm(1)).toBeCloseTo(1.852);
	});

	it("should convert km to nautical miles correctly", () => {
		expect(kmToNauticalMiles(1.852)).toBeCloseTo(1);
	});

	// Depth
	it("should convert fathoms to meters correctly", () => {
		expect(fathomsToMeters(1)).toBeCloseTo(1.8288);
	});

	it("should convert meters to fathoms correctly", () => {
		expect(metersToFathoms(1.8288)).toBeCloseTo(1);
	});

	// Temperature
	it("should convert Celsius to Fahrenheit correctly", () => {
		expect(celsiusToFahrenheit(0)).toBe(32);
		expect(celsiusToFahrenheit(100)).toBe(212);
		expect(celsiusToFahrenheit(-40)).toBe(-40);
	});

	it("should convert Fahrenheit to Celsius correctly", () => {
		expect(fahrenheitToCelsius(32)).toBe(0);
		expect(fahrenheitToCelsius(212)).toBe(100);
		expect(fahrenheitToCelsius(-40)).toBe(-40);
	});

	// Pressure
	it("should convert hPa to inHg correctly", () => {
		expect(hpaToInHg(1013.25)).toBeCloseTo(29.92, 2);
	});

	it("should convert inHg to hPa correctly", () => {
		expect(inHgToHpa(29.92)).toBeCloseTo(1013.25, 1);
	});
});
