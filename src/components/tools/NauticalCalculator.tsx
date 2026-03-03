'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  dmsToDecimal,
  decimalToDms,
  calculateDistance,
  calculateBearing,
  calculateEta,
  type DMS,
  type Coordinate,
  type Eta
} from '@/lib/nautical/calculator';

export default function NauticalCalculator() {
  const t = useTranslations('tools');
  const [activeTab, setActiveTab] = useState<'coordinates' | 'route'>('coordinates');

  // Coordinates State
  const [dmsLat, setDmsLat] = useState<DMS>({ degrees: 0, minutes: 0, seconds: 0, direction: 'N' });
  const [dmsLon, setDmsLon] = useState<DMS>({ degrees: 0, minutes: 0, seconds: 0, direction: 'E' });
  const [decimalLat, setDecimalLat] = useState<string>('0');
  const [decimalLon, setDecimalLon] = useState<string>('0');

  // Route State
  const [startPoint, setStartPoint] = useState<Coordinate>({ lat: 43.34, lon: -3.02 }); // Getxo approx
  const [endPoint, setEndPoint] = useState<Coordinate>({ lat: 43.40, lon: -3.10 });
  const [speed, setSpeed] = useState<number>(5);
  const [declination, setDeclination] = useState<number>(0); // Positive East
  const [results, setResults] = useState<{
    distance: number;
    trueBearing: number;
    magneticBearing: number;
    eta: Eta;
  } | null>(null);

  const handleConvertToDecimal = () => {
    const lat = dmsToDecimal(dmsLat);
    const lon = dmsToDecimal(dmsLon);
    setDecimalLat(lat.toString());
    setDecimalLon(lon.toString());
  };

  const handleConvertToDms = () => {
    const lat = parseFloat(decimalLat);
    const lon = parseFloat(decimalLon);
    if (!isNaN(lat)) setDmsLat(decimalToDms(lat, true));
    if (!isNaN(lon)) setDmsLon(decimalToDms(lon, false));
  };

  const handleCalculateRoute = () => {
    const dist = calculateDistance(startPoint, endPoint);
    const bearings = calculateBearing(startPoint, endPoint, declination);
    const eta = calculateEta(dist, speed);

    setResults({
      distance: dist,
      trueBearing: bearings.trueBearing,
      magneticBearing: bearings.magneticBearing,
      eta
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-[#0a1628] mb-8 text-center">{t('title')}</h1>

      <div className="flex mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('coordinates')}
          className={`flex-1 py-4 text-center font-semibold transition-colors ${
            activeTab === 'coordinates'
              ? 'border-b-2 border-[#ca8a04] text-[#0a1628]'
              : 'text-gray-500 hover:text-[#0a1628]'
          }`}
        >
          {t('coordinates.title')}
        </button>
        <button
          onClick={() => setActiveTab('route')}
          className={`flex-1 py-4 text-center font-semibold transition-colors ${
            activeTab === 'route'
              ? 'border-b-2 border-[#ca8a04] text-[#0a1628]'
              : 'text-gray-500 hover:text-[#0a1628]'
          }`}
        >
          {t('route.title')}
        </button>
      </div>

      {activeTab === 'coordinates' && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* DMS Input */}
            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-lg text-[#0a1628]">{t('coordinates.dms')}</h3>

              {/* Latitude DMS */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('coordinates.lat')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={dmsLat.degrees}
                    onChange={(e) => setDmsLat({...dmsLat, degrees: Number(e.target.value)})}
                    className="w-full p-2 border rounded text-[#0a1628]"
                    placeholder={t('coordinates.deg')}
                  />
                  <input
                    type="number"
                    value={dmsLat.minutes}
                    onChange={(e) => setDmsLat({...dmsLat, minutes: Number(e.target.value)})}
                    className="w-full p-2 border rounded text-[#0a1628]"
                    placeholder={t('coordinates.min')}
                  />
                  <input
                    type="number"
                    value={dmsLat.seconds}
                    onChange={(e) => setDmsLat({...dmsLat, seconds: Number(e.target.value)})}
                    className="w-full p-2 border rounded text-[#0a1628]"
                    placeholder={t('coordinates.sec')}
                  />
                  <select
                    value={dmsLat.direction}
                    onChange={(e) => setDmsLat({...dmsLat, direction: e.target.value as 'N'|'S'})}
                    className="p-2 border rounded bg-white text-[#0a1628]"
                  >
                    <option value="N">N</option>
                    <option value="S">S</option>
                  </select>
                </div>
              </div>

              {/* Longitude DMS */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('coordinates.lon')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={dmsLon.degrees}
                    onChange={(e) => setDmsLon({...dmsLon, degrees: Number(e.target.value)})}
                    className="w-full p-2 border rounded text-[#0a1628]"
                    placeholder={t('coordinates.deg')}
                  />
                  <input
                    type="number"
                    value={dmsLon.minutes}
                    onChange={(e) => setDmsLon({...dmsLon, minutes: Number(e.target.value)})}
                    className="w-full p-2 border rounded text-[#0a1628]"
                    placeholder={t('coordinates.min')}
                  />
                  <input
                    type="number"
                    value={dmsLon.seconds}
                    onChange={(e) => setDmsLon({...dmsLon, seconds: Number(e.target.value)})}
                    className="w-full p-2 border rounded text-[#0a1628]"
                    placeholder={t('coordinates.sec')}
                  />
                  <select
                    value={dmsLon.direction}
                    onChange={(e) => setDmsLon({...dmsLon, direction: e.target.value as 'E'|'W'})}
                    className="p-2 border rounded bg-white text-[#0a1628]"
                  >
                    <option value="E">E</option>
                    <option value="W">W</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleConvertToDecimal}
                className="w-full py-2 bg-[#0a1628] text-white rounded hover:bg-[#1a2c4e] transition-colors"
              >
                {t('coordinates.convert_to_decimal')}
              </button>
            </div>

            {/* Decimal Input */}
            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-lg text-[#0a1628]">{t('coordinates.decimal')}</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('coordinates.lat')}</label>
                <input
                  type="number"
                  step="0.000001"
                  value={decimalLat}
                  onChange={(e) => setDecimalLat(e.target.value)}
                  className="w-full p-2 border rounded text-[#0a1628]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('coordinates.lon')}</label>
                <input
                  type="number"
                  step="0.000001"
                  value={decimalLon}
                  onChange={(e) => setDecimalLon(e.target.value)}
                  className="w-full p-2 border rounded text-[#0a1628]"
                />
              </div>

              <button
                onClick={handleConvertToDms}
                className="w-full py-2 bg-[#ca8a04] text-white rounded hover:bg-[#eab308] transition-colors"
              >
                {t('coordinates.convert_to_dms')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'route' && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg space-y-4">
                <h3 className="font-bold text-[#0a1628]">{t('route.point_a')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">{t('coordinates.lat')}</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={startPoint.lat}
                      onChange={(e) => setStartPoint({...startPoint, lat: parseFloat(e.target.value)})}
                      className="w-full p-2 border rounded text-[#0a1628]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">{t('coordinates.lon')}</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={startPoint.lon}
                      onChange={(e) => setStartPoint({...startPoint, lon: parseFloat(e.target.value)})}
                      className="w-full p-2 border rounded text-[#0a1628]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg space-y-4">
                <h3 className="font-bold text-[#0a1628]">{t('route.point_b')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">{t('coordinates.lat')}</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={endPoint.lat}
                      onChange={(e) => setEndPoint({...endPoint, lat: parseFloat(e.target.value)})}
                      className="w-full p-2 border rounded text-[#0a1628]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">{t('coordinates.lon')}</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={endPoint.lon}
                      onChange={(e) => setEndPoint({...endPoint, lon: parseFloat(e.target.value)})}
                      className="w-full p-2 border rounded text-[#0a1628]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('route.speed')}</label>
                    <input
                      type="number"
                      min="0"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full p-2 border rounded text-[#0a1628]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('route.declination')}</label>
                    <div className="flex gap-2">
                       <input
                        type="number"
                        value={declination}
                        onChange={(e) => setDeclination(parseFloat(e.target.value))}
                        className="w-full p-2 border rounded text-[#0a1628]"
                      />
                      <span className="text-xs text-gray-500 self-center">
                        {declination > 0 ? t('route.east') : declination < 0 ? t('route.west') : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCalculateRoute}
                className="w-full py-3 bg-[#0a1628] text-white font-bold rounded shadow-md hover:bg-[#1a2c4e] transition-colors"
              >
                {t('route.calculate')}
              </button>
            </div>

            {/* Results */}
            <div className="bg-[#0a1628] text-white p-8 rounded-xl flex flex-col justify-center">
              <h3 className="text-2xl font-light mb-6 border-b border-gray-700 pb-2">{t('route.results')}</h3>

              {results ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">{t('route.distance')}</p>
                    <p className="text-4xl font-bold text-[#ca8a04]">{results.distance} <span className="text-lg text-white">NM</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 uppercase tracking-wider">{t('route.true_bearing')}</p>
                      <p className="text-3xl font-mono">{results.trueBearing}°</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 uppercase tracking-wider">{t('route.magnetic_bearing')}</p>
                      <p className="text-3xl font-mono">{results.magneticBearing}°</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">{t('route.eta')}</p>
                    <div className="flex gap-4 items-baseline">
                      {results.eta.days > 0 && (
                        <p className="text-2xl"><span className="font-bold">{results.eta.days}</span>{t('route.days')}</p>
                      )}
                      <p className="text-2xl"><span className="font-bold">{results.eta.hours}</span>{t('route.hours')}</p>
                      <p className="text-xl text-gray-300"><span className="font-bold">{results.eta.minutes}</span>{t('route.minutes')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 italic py-12">
                  {t('route.calculate')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
