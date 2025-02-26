/**
 * LiveTreinen_AppsScript - Configuratiemodule
 * Bevat centrale instellingen voor de toepassing
 */

// Cache-instellingen
const CACHE_EXPIRATION_SEC = 15;  // Cache-levensduur in seconden

// API-instellingen
const MAX_RETRIES = 2;  // Maximaal aantal retries bij tijdelijke fouten

// API-endpoints
const NS_TRAIN_API_ENDPOINT = "https://gateway.apiportal.ns.nl/virtual-train-api/api/vehicle?lat=0&lng=0&features=trein";
const NS_JOURNEY_API_ENDPOINT = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/journey";

// Fouttypen en hun beschrijvingen
const ERROR_TYPES = {
  AUTHENTICATION: { code: 'AUTH_ERROR', message: 'Authenticatiefout bij NS API', severity: 'ERROR' },
  RATE_LIMIT: { code: 'RATE_LIMIT', message: 'API-limiet overschreden', severity: 'WARNING' },
  NETWORK: { code: 'NETWORK_ERROR', message: 'Netwerkfout bij verbinden met NS API', severity: 'ERROR' },
  API_ERROR: { code: 'API_ERROR', message: 'Fout bij NS API', severity: 'ERROR' },
  DATA_ERROR: { code: 'DATA_ERROR', message: 'Fout bij het verwerken van API-gegevens', severity: 'ERROR' },
  TIMEOUT: { code: 'TIMEOUT', message: 'Timeout bij NS API', severity: 'WARNING' }
};