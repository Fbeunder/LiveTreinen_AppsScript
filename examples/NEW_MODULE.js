/**
 * VOORBEELD: Het creëren van een nieuwe module
 * 
 * Dit voorbeeld toont hoe je een nieuwe module kunt toevoegen aan het project
 * In dit geval: Een module voor het bijhouden van statistieken over treinbewegingen
 */

// ========== MAAK EEN NIEUW BESTAND AAN: StatisticsService.js ==========

/**
 * LiveTreinen_AppsScript - Statistics Service Module
 * Verzamelt en analyseert statistieken over treinbewegingen
 */

// Constanten voor deze module
const STATS_CACHE_EXPIRATION = 3600; // 1 uur in seconden
const MAX_HISTORY_POINTS = 100;  // Maximaal aantal datapunten per trein

/**
 * Voegt een nieuw datapunt toe aan de statistieken voor een trein
 * @param {Object} train - Treinobject met minimaal ritId, lat, lng, en snelheid
 * @return {boolean} Succes of mislukking
 */
function recordTrainStats(train) {
  try {
    if (!train || !train.ritId) {
      logWarning('Ongeldige treindata ontvangen voor statistieken');
      return false;
    }

    const cacheKey = `train_stats_${train.ritId}`;
    const cache = CacheService.getScriptCache();
    let stats = [];
    
    // Haal bestaande stats op
    const cachedStats = cache.get(cacheKey);
    if (cachedStats) {
      try {
        stats = JSON.parse(cachedStats);
      } catch (error) {
        logWarning(`Fout bij parsen van gecachte stats voor trein ${train.ritId}`, error);
        stats = [];
      }
    }
    
    // Voeg nieuw datapunt toe
    const timestamp = new Date().toISOString();
    stats.push({
      timestamp: timestamp,
      lat: train.lat,
      lng: train.lng,
      speed: train.snelheid,
      // Voeg andere relevante gegevens toe
    });
    
    // Beperk de grootte door oudste items te verwijderen als nodig
    if (stats.length > MAX_HISTORY_POINTS) {
      stats = stats.slice(stats.length - MAX_HISTORY_POINTS);
    }
    
    // Sla op in cache
    cache.put(cacheKey, JSON.stringify(stats), STATS_CACHE_EXPIRATION);
    return true;
  } catch (error) {
    logError(`Fout bij opslaan van statistieken voor trein ${train.ritId}`, error);
    return false;
  }
}

/**
 * Haalt historische statistieken op voor een trein
 * @param {string} trainId - ID van de trein
 * @return {Object[]} Array met historische datapunten
 */
function getTrainStats(trainId) {
  if (!trainId) {
    logWarning('Geen trainId opgegeven voor getTrainStats');
    return [];
  }
  
  const cacheKey = `train_stats_${trainId}`;
  const cache = CacheService.getScriptCache();
  const cachedStats = cache.get(cacheKey);
  
  if (!cachedStats) {
    return [];
  }
  
  try {
    return JSON.parse(cachedStats);
  } catch (error) {
    logError(`Fout bij parsen van statistieken voor trein ${trainId}`, error);
    return [];
  }
}

/**
 * Berekent de gemiddelde snelheid voor een trein over de beschikbare datapunten
 * @param {string} trainId - ID van de trein
 * @return {number} Gemiddelde snelheid of 0 als er geen data is
 */
function getAverageSpeed(trainId) {
  const stats = getTrainStats(trainId);
  
  if (stats.length === 0) {
    return 0;
  }
  
  const totalSpeed = stats.reduce((sum, point) => sum + (point.speed || 0), 0);
  return Math.round(totalSpeed / stats.length);
}

/**
 * Berekent de afgelegde afstand voor een trein
 * @param {string} trainId - ID van de trein
 * @return {number} Afgelegde afstand in kilometers
 */
function getTotalDistance(trainId) {
  const stats = getTrainStats(trainId);
  
  if (stats.length < 2) {
    return 0;
  }
  
  let distance = 0;
  for (let i = 1; i < stats.length; i++) {
    distance += calculateDistance(
      stats[i-1].lat, stats[i-1].lng,
      stats[i].lat, stats[i].lng
    );
  }
  
  return Math.round(distance * 10) / 10; // Rond af op 1 decimaal
}

/**
 * Hulpfunctie om afstand tussen twee coördinaten te berekenen (Haversine formule)
 * @private
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius van de aarde in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Afstand in km
}

// ========== UPDATE ApiService.js ==========
// Voeg deze regel toe aan het einde van de getTreinPosities functie, net voor het returnen van treinen:

// Registreer statistieken voor elke trein
treinen.forEach(function(train) {
  recordTrainStats(train);
});

// ========== UPDATE Main.js ==========
// Voeg deze case toe aan de doGet functie:

else if (e.parameter && e.parameter.action == "getTrainStats") {
  // Endpoint voor het ophalen van treinstatistieken
  var trainId = e.parameter.trainId;
  if (!trainId) {
    return createErrorResponse('Geen trainId opgegeven', 400);
  }
  
  var stats = {
    history: getTrainStats(trainId),
    averageSpeed: getAverageSpeed(trainId),
    totalDistance: getTotalDistance(trainId)
  };
  
  return ContentService.createTextOutput(JSON.stringify(stats))
                       .setMimeType(ContentService.MimeType.JSON);
}
