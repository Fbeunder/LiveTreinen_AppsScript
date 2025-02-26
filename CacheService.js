/**
 * LiveTreinen_AppsScript - Cache Service Module
 * Bevat functies voor het cachen van API-responses om API-limiet te respecteren
 */

/**
 * Haalt data op uit de cache of maakt een nieuwe API-aanroep als de cache verlopen is
 * @param {string} cacheKey - Unieke sleutel voor het cachen van de data
 * @param {Function} fetchFunction - Functie die de data ophaalt als deze niet in de cache zit
 * @param {number} [expirationSec=CACHE_EXPIRATION_SEC] - Levensduur van de cache in seconden
 * @return {Object} De gevraagde data uit cache of via de fetchFunction
 */
function getOrFetchData(cacheKey, fetchFunction, expirationSec = CACHE_EXPIRATION_SEC) {
  const cache = CacheService.getScriptCache();
  let cached = cache.get(cacheKey);
  
  if (cached) {
    logInfo(`Data opgehaald uit cache voor sleutel: ${cacheKey}`);
    try {
      return JSON.parse(cached);
    } catch (error) {
      logWarning(`Fout bij het parsen van gecachte data voor sleutel: ${cacheKey}`, error);
      // Ga door met ophalen nieuwe data (cache negeren)
    }
  }
  
  // Data niet in cache of parse-fout, ophalen via fetchFunction
  const data = fetchFunction();
  
  // Alleen cachen als er geen fout is (als het geen foutobject is)
  if (!data.error) {
    try {
      cache.put(cacheKey, JSON.stringify(data), expirationSec);
      logInfo(`Data gecached voor sleutel: ${cacheKey} (${expirationSec} sec)`);
    } catch (error) {
      logWarning(`Fout bij het cachen van data voor sleutel: ${cacheKey}`, error);
      // Doorgaan zonder caching
    }
  }
  
  return data;
}