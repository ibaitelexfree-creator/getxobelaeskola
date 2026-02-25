-- Seed data: Experiencias from Google Spreadsheet
-- Run after 20240101000059_experiencias.sql

-- ============================================
-- CUMPLEAÑOS (Birthdays / Urtebetetetxeak)
-- ============================================
INSERT INTO public.experiencias (slug, nombre_es, nombre_eu, nombre_en, descripcion_es, descripcion_eu, descripcion_en, tipo, precio, precio_tipo, min_participantes, duracion_h, fianza, imagen_url, recurrente, orden)
VALUES
  ('cumpleanos-navegacion', 'Cumpleaños Navegación', 'Urtebetetze Nabigazioa', 'Birthday Sailing', 
   'Celebra tu cumpleaños navegando con amigos. Incluye actividad de navegación guiada para grupos.',
   'Ospatu zure urtebetetzea lagunekin nabigatuz. Talde nabigazioa barne.',
   'Celebrate your birthday sailing with friends. Includes guided group sailing activity.',
   'cumpleanos', 14.00, 'por_persona', 12, NULL, NULL, '/images/experiences/birthday-sailing.webp', true, 1),

  ('cumpleanos-bigsub', 'Cumpleaños BigSub', 'Urtebetetze BigSub', 'Birthday BigSub',
   'Fiesta de cumpleaños con actividad BigSub para grupos de 12 personas.',
   '12 pertsonentzako urtebetetze festa BigSub jarduerarekin.',
   'Birthday party with BigSub activity for groups of 12.',
   'cumpleanos', 13.00, 'por_persona', 12, NULL, '/images/experiences/birthday-bigsub.webp', true, 2),

  ('cumpleanos-espacio', 'Alquiler Espacio Cumpleaños', 'Urtebetetze Espazioa', 'Birthday Space Rental',
   'Alquiler de espacio para celebraciones de cumpleaños. Horario: 16:30-20:30.',
   'Urtebetetze ospakizunetarako espazioaren alokairua. Ordutegia: 16:30-20:30.',
   'Space rental for birthday celebrations. Schedule: 16:30-20:30.',
   'cumpleanos', 150.00, 'plana', NULL, 4.0, 100.00, '/images/experiences/birthday-space.webp', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- BONOS (Vouchers)
-- ============================================
INSERT INTO public.experiencias (slug, nombre_es, nombre_eu, nombre_en, descripcion_es, descripcion_eu, descripcion_en, tipo, precio, precio_tipo, duracion_h, recurrente, orden)
VALUES
  ('bono-vela-ligera', 'Bono Vela Ligera', 'Bela Arina Bonoa', 'Light Sailing Voucher',
   'Bono de 5 salidas de vela ligera. Ideal para practicar a tu ritmo.',
   '5 irteeratako bela arina bonoa. Zure erritmoan praktikatzeko aproposa.',
   'Light sailing voucher for 5 sessions. Practice at your own pace.',
   'bono', 150.00, 'plana', NULL, true, 10),

  ('bono-windsurf', 'Bono Windsurf', 'Windsurf Bonoa', 'Windsurf Voucher',
   'Bono de 5 salidas de windsurf.',
   '5 irteeratako windsurf bonoa.',
   'Windsurf voucher for 5 sessions.',
   'bono', 130.00, 'plana', NULL, true, 11),

  ('bono-navegacion', 'Bono Navegación', 'Nabigazio Bonoa', 'Navigation Voucher',
   'Bono de 5 salidas de navegación en embarcación.',
   '5 irteeratako nabigazio bonoa ontzian.',
   'Navigation voucher for 5 sailing sessions.',
   'bono', 150.00, 'plana', NULL, true, 12)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ATRAQUES (Moorings)
-- ============================================
INSERT INTO public.experiencias (slug, nombre_es, nombre_eu, nombre_en, descripcion_es, descripcion_eu, descripcion_en, tipo, precio_mensual, precio_tipo, fianza, recurrente, orden)
VALUES
  ('atraque-velero', 'Atraque Velero', 'Belaontziaren Atraka', 'Sailboat Mooring',
   'Plaza de atraque mensual para velero. Matrícula: 50€.',
   'Belaontziarentzako hileko atraka plaza. Matrikula: 50€.',
   'Monthly mooring spot for sailboat. Registration: €50.',
   'atraque', 50.00, 'por_mes', 50.00, true, 20),

  ('atraque-windsurf', 'Atraque Windsurf', 'Windsurf Atraka', 'Windsurf Mooring',
   'Plaza de atraque mensual para material de windsurf. Matrícula: 50€.',
   'Windsurf materialentzako hileko atraka plaza. Matrikula: 50€.',
   'Monthly mooring spot for windsurf equipment. Registration: €50.',
   'atraque', 30.00, 'por_mes', 50.00, true, 21),

  ('atraque-piragua', 'Atraque Piragua', 'Piraga Atraka', 'Canoe Mooring',
   'Plaza de atraque mensual para piragua. Matrícula: 50€.',
   'Piragarentzako hileko atraka plaza. Matrikula: 50€.',
   'Monthly mooring spot for canoe. Registration: €50.',
   'atraque', 25.00, 'por_mes', 50.00, true, 22)
ON CONFLICT (slug) DO NOTHING;
