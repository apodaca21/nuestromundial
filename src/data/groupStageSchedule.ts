/**
 * Calendario fase de grupos — FIFA World Cup 2026
 * Fechas, sedes y enfrentamientos según fifa.com (mar 2026)
 * Horarios: fuente TV México / FIFA donde está confirmado; resto en franjas oficiales del día
 */
export const GROUP_STAGE_LINES = `
2026-06-11|12:00|America/Mexico_City|A|MEX|RSA|Estadio Ciudad de México|Ciudad de México
2026-06-11|19:00|America/Mexico_City|A|KOR|CZE|Estadio Guadalajara|Guadalajara
2026-06-12|12:00|America/Toronto|B|CAN|BIH|Estadio Toronto|Toronto
2026-06-12|15:00|America/Los_Angeles|D|USA|PAR|SoFi Stadium|Los Ángeles
2026-06-13|12:00|America/New_York|C|HAI|SCO|Gillette Stadium|Boston
2026-06-13|15:00|America/Vancouver|D|AUS|TUR|BC Place|Vancouver
2026-06-13|18:00|America/New_York|C|BRA|MAR|MetLife Stadium|Nueva York
2026-06-13|21:00|America/Los_Angeles|B|QAT|SUI|Levi's Stadium|San Francisco
2026-06-14|12:00|America/New_York|E|CIV|ECU|Lincoln Financial Field|Filadelfia
2026-06-14|15:00|America/Chicago|E|GER|CUW|NRG Stadium|Houston
2026-06-14|18:00|America/Chicago|F|NED|JPN|AT&T Stadium|Dallas
2026-06-14|21:00|America/Mexico_City|F|SWE|TUN|Estadio Monterrey|Monterrey
2026-06-15|12:00|America/New_York|H|KSA|URU|Hard Rock Stadium|Miami
2026-06-15|15:00|America/New_York|H|ESP|CPV|Mercedes-Benz Stadium|Atlanta
2026-06-15|18:00|America/Los_Angeles|G|IRN|NZL|SoFi Stadium|Los Ángeles
2026-06-15|21:00|America/Los_Angeles|G|BEL|EGY|Lumen Field|Seattle
2026-06-16|12:00|America/New_York|I|FRA|SEN|MetLife Stadium|Nueva York
2026-06-16|15:00|America/New_York|I|IRQ|NOR|Gillette Stadium|Boston
2026-06-16|18:00|America/Chicago|J|ARG|ALG|Arrowhead Stadium|Kansas City
2026-06-16|21:00|America/Los_Angeles|J|AUT|JOR|Levi's Stadium|San Francisco
2026-06-17|12:00|America/Toronto|L|GHA|PAN|BMO Field|Toronto
2026-06-17|15:00|America/Chicago|L|ENG|CRO|AT&T Stadium|Dallas
2026-06-17|18:00|America/Chicago|K|POR|COD|NRG Stadium|Houston
2026-06-17|21:00|America/Mexico_City|K|UZB|COL|Estadio Ciudad de México|Ciudad de México
2026-06-18|12:00|America/New_York|A|CZE|RSA|Mercedes-Benz Stadium|Atlanta
2026-06-18|15:00|America/Los_Angeles|B|SUI|BIH|SoFi Stadium|Los Ángeles
2026-06-18|18:00|America/Vancouver|B|CAN|QAT|BC Place|Vancouver
2026-06-18|21:00|America/Mexico_City|A|MEX|KOR|Estadio Guadalajara|Guadalajara
2026-06-19|12:00|America/New_York|C|BRA|HAI|Lincoln Financial Field|Filadelfia
2026-06-19|15:00|America/New_York|C|SCO|MAR|Gillette Stadium|Boston
2026-06-19|18:00|America/Los_Angeles|D|TUR|PAR|Levi's Stadium|San Francisco
2026-06-19|21:00|America/Los_Angeles|D|USA|AUS|Lumen Field|Seattle
2026-06-20|12:00|America/Toronto|E|GER|CIV|BMO Field|Toronto
2026-06-20|15:00|America/Chicago|E|ECU|CUW|Arrowhead Stadium|Kansas City
2026-06-20|18:00|America/Chicago|F|NED|SWE|NRG Stadium|Houston
2026-06-20|21:00|America/Mexico_City|F|TUN|JPN|Estadio Monterrey|Monterrey
2026-06-21|12:00|America/New_York|H|URU|CPV|Hard Rock Stadium|Miami
2026-06-21|15:00|America/New_York|H|ESP|KSA|Mercedes-Benz Stadium|Atlanta
2026-06-21|18:00|America/Los_Angeles|G|BEL|IRN|SoFi Stadium|Los Ángeles
2026-06-21|21:00|America/Vancouver|G|NZL|EGY|BC Place|Vancouver
2026-06-22|12:00|America/New_York|I|NOR|SEN|MetLife Stadium|Nueva York
2026-06-22|15:00|America/New_York|I|FRA|IRQ|Lincoln Financial Field|Filadelfia
2026-06-22|18:00|America/Chicago|J|ARG|AUT|AT&T Stadium|Dallas
2026-06-22|21:00|America/Los_Angeles|J|JOR|ALG|Levi's Stadium|San Francisco
2026-06-23|12:00|America/New_York|L|ENG|GHA|Gillette Stadium|Boston
2026-06-23|15:00|America/Toronto|L|PAN|CRO|BMO Field|Toronto
2026-06-23|18:00|America/Chicago|K|POR|UZB|NRG Stadium|Houston
2026-06-23|21:00|America/Mexico_City|K|COL|COD|Estadio Guadalajara|Guadalajara
2026-06-24|12:00|America/New_York|C|SCO|BRA|Hard Rock Stadium|Miami
2026-06-24|15:00|America/New_York|C|MAR|HAI|Mercedes-Benz Stadium|Atlanta
2026-06-24|18:00|America/Vancouver|B|SUI|CAN|BC Place|Vancouver
2026-06-24|18:00|America/Los_Angeles|B|BIH|QAT|Lumen Field|Seattle
2026-06-24|21:00|America/Mexico_City|A|CZE|MEX|Estadio Ciudad de México|Ciudad de México
2026-06-24|21:00|America/Mexico_City|A|RSA|KOR|Estadio Monterrey|Monterrey
2026-06-25|12:00|America/New_York|E|CUW|CIV|Lincoln Financial Field|Filadelfia
2026-06-25|15:00|America/New_York|E|ECU|GER|MetLife Stadium|Nueva York
2026-06-25|18:00|America/Chicago|F|JPN|SWE|AT&T Stadium|Dallas
2026-06-25|21:00|America/Chicago|F|TUN|NED|Arrowhead Stadium|Kansas City
2026-06-25|21:00|America/Los_Angeles|D|TUR|USA|SoFi Stadium|Los Ángeles
2026-06-25|21:00|America/Los_Angeles|D|PAR|AUS|Levi's Stadium|San Francisco
2026-06-26|12:00|America/New_York|I|NOR|FRA|Gillette Stadium|Boston
2026-06-26|15:00|America/Toronto|I|SEN|IRQ|BMO Field|Toronto
2026-06-26|18:00|America/Los_Angeles|G|EGY|IRN|Lumen Field|Seattle
2026-06-26|18:00|America/Vancouver|G|NZL|BEL|BC Place|Vancouver
2026-06-26|21:00|America/Chicago|H|CPV|KSA|NRG Stadium|Houston
2026-06-26|21:00|America/Mexico_City|H|URU|ESP|Estadio Guadalajara|Guadalajara
2026-06-27|12:00|America/New_York|L|PAN|ENG|MetLife Stadium|Nueva York
2026-06-27|15:00|America/New_York|L|CRO|GHA|Lincoln Financial Field|Filadelfia
2026-06-27|18:00|America/Chicago|J|ALG|AUT|Arrowhead Stadium|Kansas City
2026-06-27|18:00|America/Chicago|J|JOR|ARG|AT&T Stadium|Dallas
2026-06-27|21:00|America/New_York|K|COL|POR|Hard Rock Stadium|Miami
2026-06-27|21:00|America/New_York|K|COD|UZB|Mercedes-Benz Stadium|Atlanta
`.trim()
