/**
 * Configuratieconstanten voor de LiveTreinen applicatie
 */

// Cache-levensduur in seconden
const CACHE_EXPIRATION_SEC = 15;

// Maximaal aantal retries bij tijdelijke fouten
const MAX_RETRIES = 2;

// Fouttypen en hun beschrijvingen
const ERROR_TYPES = {
  AUTHENTICATION: { code: 'AUTH_ERROR', message: 'Authenticatiefout bij NS API', severity: 'ERROR' },
  RATE_LIMIT: { code: 'RATE_LIMIT', message: 'API-limiet overschreden', severity: 'WARNING' },
  NETWORK: { code: 'NETWORK_ERROR', message: 'Netwerkfout bij verbinden met NS API', severity: 'ERROR' },
  API_ERROR: { code: 'API_ERROR', message: 'Fout bij NS API', severity: 'ERROR' },
  DATA_ERROR: { code: 'DATA_ERROR', message: 'Fout bij het verwerken van API-gegevens', severity: 'ERROR' },
  TIMEOUT: { code: 'TIMEOUT', message: 'Timeout bij NS API', severity: 'WARNING' }
};

// API URL constanten
const NS_API_URLS = {
  TRAIN_POSITIONS: "https://gateway.apiportal.ns.nl/virtual-train-api/api/vehicle?lat=0&lng=0&features=trein",
  JOURNEY_DETAILS: "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/journey?train="
};
