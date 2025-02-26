/**
 * LiveTreinen_AppsScript - Cache Service Module
 * Bevat functies voor het cachen van API-responses om API-limiet te respecteren
 */

// Cache statistieken bijhouden
let cacheStats = {
  hits: 0,
  misses: 0,
  errors: 0,
  lastReset: new Date().toISOString()
};

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
  let isCached = false;
  
  if (cached) {
    logInfo(`Data opgehaald uit cache voor sleutel: ${cacheKey}`);
    try {
      // Increment cache hit counter
      if (STATS_ENABLED) cacheStats.hits++;
      
      isCached = true;
      return JSON.parse(cached);
    } catch (error) {
      logWarning(`Fout bij het parsen van gecachte data voor sleutel: ${cacheKey}`, error);
      // Increment cache error counter
      if (STATS_ENABLED) cacheStats.errors++;
      // Ga door met ophalen nieuwe data (cache negeren)
    }
  }
  
  // Data niet in cache of parse-fout, ophalen via fetchFunction
  if (STATS_ENABLED && !isCached) cacheStats.misses++;
  
  const data = fetchFunction();
  
  // Alleen cachen als er geen fout is (als het geen foutobject is)
  if (!data.error) {
    try {
      cache.put(cacheKey, JSON.stringify(data), expirationSec);
      logInfo(`Data gecached voor sleutel: ${cacheKey} (${expirationSec} sec)`);
    } catch (error) {
      logWarning(`Fout bij het cachen van data voor sleutel: ${cacheKey}`, error);
      // Increment cache error counter
      if (STATS_ENABLED) cacheStats.errors++;
      // Doorgaan zonder caching
    }
  }
  
  return data;
}

/**
 * Bouwt een gecombineerde cache sleutel met prefix om verschillende data types te scheiden
 * @param {string} prefix - De prefix die het type data aangeeft (uit CACHE_PREFIX)
 * @param {string} key - De basis-sleutel voor de data
 * @param {Object} [params=null] - Optionele parameters om toe te voegen aan de sleutel
 * @return {string} - De complete unieke cache-sleutel
 */
function buildCacheKey(prefix, key, params = null) {
  let cacheKey = prefix + key;
  
  if (params) {
    // Sorteer keys om consistentie te garanderen
    const paramKeys = Object.keys(params).sort();
    const paramString = paramKeys
      .filter(k => params[k] !== null && params[k] !== undefined)
      .map(k => `${k}=${params[k]}`)
      .join('_');
    
    if (paramString) {
      cacheKey += '_' + paramString;
    }
  }
  
  return cacheKey;
}

/**
 * Haalt cache statistieken op
 * @return {Object} - Cache statistieken (hits, misses, ratio)
 */
function getCacheStats() {
  if (!STATS_ENABLED) return { enabled: false };
  
  const total = cacheStats.hits + cacheStats.misses;
  const hitRatio = total > 0 ? (cacheStats.hits / total * 100).toFixed(2) : 0;
  
  return {
    enabled: true,
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    errors: cacheStats.errors,
    total: total,
    hitRatio: `${hitRatio}%`,
    sinceReset: cacheStats.lastReset
  };
}

/**
 * Reset cache statistieken
 */
function resetCacheStats() {
  cacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    lastReset: new Date().toISOString()
  };
  return { success: true, message: "Cache statistieken gereset" };
}

/**
 * Haalt alle beschikbare cache-sleutels op die beginnen met een bepaalde prefix
 * Nuttig voor debugging en monitoring
 * @param {string} prefix - De prefix om te zoeken
 * @return {string[]} - Lijst met gevonden cache-sleutels
 */
function getCacheKeys(prefix) {
  // Deze functie werkt alleen bij batch caching, maar hier tonen voor volledigheid
  // In Apps Script is er geen directe manier om alle keys te zien
  // Hier zou je een eigen administratie van keys kunnen bijhouden
  return [
    `Beschikbare prefixes: ${Object.values(CACHE_PREFIX).join(', ')}`,
    'In Apps Script is directe inspectie van alle cache keys niet mogelijk.'
  ];
}

/**
 * Invalideert een specifieke cache-entry
 * @param {string} cacheKey - De te invalideren cache-sleutel
 * @return {Object} - Status van de operatie
 */
function invalidateCache(cacheKey) {
  try {
    const cache = CacheService.getScriptCache();
    cache.remove(cacheKey);
    logInfo(`Cache geïnvalideerd voor sleutel: ${cacheKey}`);
    return { success: true, message: `Cache geïnvalideerd voor: ${cacheKey}` };
  } catch (error) {
    logError(`Fout bij invalideren cache voor sleutel: ${cacheKey}`, error);
    return { success: false, message: `Fout bij invalideren: ${error.message}` };
  }
}

/**
 * Invalideert meerdere cache-entries op basis van een prefix
 * @param {string} prefix - De prefix voor alle te invalideren cache-sleutels
 * @return {Object} - Status van de operatie
 */
function invalidateCacheByPrefix(prefix) {
  // In Apps Script is er geen directe manier om meerdere keys tegelijk te verwijderen op basis van prefix
  // Als dit nodig is, zou je de keys in Properties Service kunnen bijhouden per prefix
  logWarning(`Massa-invalidatie van cache met prefix '${prefix}' is niet direct mogelijk in Apps Script.`);
  return { 
    success: false, 
    message: "Prefix-gebaseerde invalidatie is niet geïmplementeerd" 
  };
}

/**
 * Controleert of voor een bepaalde train recente cache beschikbaar is
 * @param {string} trainNumber - Het treinnummer om te controleren
 * @return {boolean} - Of er recente cache is voor deze trein
 */
function hasFreshCache(trainNumber) {
  const journeyKey = buildCacheKey(CACHE_PREFIX.JOURNEY, trainNumber);
  const positionKey = buildCacheKey(CACHE_PREFIX.TRAIN, trainNumber);
  
  const cache = CacheService.getScriptCache();
  const keys = [journeyKey, positionKey];
  const values = cache.getAll(keys);
  
  return Object.keys(values).length > 0;
}