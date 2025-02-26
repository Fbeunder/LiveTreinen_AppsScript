const CACHE_EXPIRATION_SEC = 15;  // Cache-levensduur in seconden
const MAX_RETRIES = 2;  // Maximaal aantal retries bij tijdelijke fouten

// Fouttypen en hun beschrijvingen
const ERROR_TYPES = {
  AUTHENTICATION: { code: 'AUTH_ERROR', message: 'Authenticatiefout bij NS API', severity: 'ERROR' },
  RATE_LIMIT: { code: 'RATE_LIMIT', message: 'API-limiet overschreden', severity: 'WARNING' },
  NETWORK: { code: 'NETWORK_ERROR', message: 'Netwerkfout bij verbinden met NS API', severity: 'ERROR' },
  API_ERROR: { code: 'API_ERROR', message: 'Fout bij NS API', severity: 'ERROR' },
  DATA_ERROR: { code: 'DATA_ERROR', message: 'Fout bij het verwerken van API-gegevens', severity: 'ERROR' },
  TIMEOUT: { code: 'TIMEOUT', message: 'Timeout bij NS API', severity: 'WARNING' }
};

/**
 * Hoofdfunctie die verzoeken afhandelt
 * @param {Object} e - Het request object van Apps Script
 * @return {HtmlOutput|TextOutput} HTML pagina of JSON data
 */
function doGet(e) {
  try {
    logInfo('Verzoek ontvangen: ' + JSON.stringify(e.parameter));
    
    if (e.parameter && e.parameter.action == "getData") {
      // Endpoint voor het ophalen van treinposities
      const trainId = e.parameter.trainId || null;
      const data = getTreinPosities(trainId);
      return ContentService.createTextOutput(JSON.stringify(data))
                           .setMimeType(ContentService.MimeType.JSON);
    } else if (e.parameter && e.parameter.action == "getJourney") {
      // Endpoint voor het ophalen van journey-details voor een specifiek treinnummer
      var trainNumber = e.parameter.train;
      if (!trainNumber) {
        return createErrorResponse('Geen treinnummer opgegeven', 400);
      }
      var journey = getJourneyDetails(trainNumber);
      return ContentService.createTextOutput(JSON.stringify(journey))
                           .setMimeType(ContentService.MimeType.JSON);
    } else {
      // Serveer de HTML-interface
      let htmlOutput = HtmlService.createHtmlOutputFromFile('Index')
                                  .addMetaTag('viewport', 'width=device-width, initial-scale=1')
                                  .setTitle('Live Treinposities');
      return htmlOutput;
    }
  } catch (error) {
    logError('Onverwachte fout in doGet', error);
    return createErrorResponse('Interne serverfout', 500);
  }
}

/**
 * Maakt een gestandaardiseerd foutantwoord
 * @param {string} message - Foutmelding
 * @param {number} statusCode - HTTP statuscode
 * @return {TextOutput} JSON response met fout
 */
function createErrorResponse(message, statusCode) {
  const response = {
    error: true,
    message: message,
    statusCode: statusCode
  };
  return ContentService.createTextOutput(JSON.stringify(response))
                       .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Haalt treinposities op van de NS API
 * @param {string|null} trainId - Optioneel treinnummer om te filteren
 * @return {Object[]} Array met treinposities of foutobject
 */
function getTreinPosities(trainId) {
  const cacheKey = "trainPositions" + (trainId ? "_" + trainId : "");
  const cache = CacheService.getScriptCache();
  let cached = cache.get(cacheKey);
  let treinen;
  
  if (cached) {
    logInfo(`Treingegevens opgehaald uit cache${trainId ? ' voor trein ' + trainId : ''}`);
    try {
      treinen = JSON.parse(cached);
      return treinen;
    } catch (error) {
      logWarning('Fout bij het parsen van gecachte treingegevens', error);
      // Ga door met ophalen nieuwe data (cache negeren)
    }
  }
  
  var apiKey = PropertiesService.getScriptProperties().getProperty("NS_API_KEY");
  if (!apiKey) {
    const error = 'NS API-sleutel ontbreekt. Configureer deze in de ScriptProperties.';
    logError(error);
    return { error: ERROR_TYPES.AUTHENTICATION.code, message: error };
  }
  
  var url = "https://gateway.apiportal.ns.nl/virtual-train-api/api/vehicle?lat=0&lng=0&features=trein";
  var options = {
    method: "get",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey
    },
    muteHttpExceptions: true
  };

  let retries = 0;
  while (retries <= MAX_RETRIES) {
    try {
      logInfo(`API-verzoek voor treinposities - poging ${retries + 1}`);
      var response = UrlFetchApp.fetch(url, options);
      var responseCode = response.getResponseCode();
      
      if (responseCode !== 200) {
        // Afhandeling van verschillende HTTP-foutcodes
        if (responseCode === 401 || responseCode === 403) {
          const error = `Authenticatiefout bij NS API (${responseCode})`;
          logError(error);
          return handleApiError(ERROR_TYPES.AUTHENTICATION, error);
        } else if (responseCode === 429) {
          const error = `API-limiet overschreden (${responseCode})`;
          logWarning(error);
          if (retries < MAX_RETRIES) {
            retries++;
            Utilities.sleep(1000 * (retries * 2)); // Exponential backoff
            continue;
          }
          return handleApiError(ERROR_TYPES.RATE_LIMIT, error);
        } else if (responseCode >= 500) {
          const error = `NS API serverfout (${responseCode})`;
          logError(error);
          if (retries < MAX_RETRIES) {
            retries++;
            Utilities.sleep(1000); // Wacht 1 seconde voor retry
            continue;
          }
          return handleApiError(ERROR_TYPES.API_ERROR, error);
        } else {
          const error = `Onverwachte HTTP status: ${responseCode}`;
          logError(error);
          return handleApiError(ERROR_TYPES.API_ERROR, error);
        }
      }
      
      var responseText = response.getContentText();
      var data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        const errorMsg = 'Fout bij het parsen van API-response';
        logError(errorMsg, error);
        return handleApiError(ERROR_TYPES.DATA_ERROR, errorMsg);
      }
      
      treinen = [];
      if (data.payload && data.payload.treinen) {
        treinen = data.payload.treinen;
      } else {
        const warning = 'Geen treingegevens in API-response of onverwachte responsestructuur';
        logWarning(warning);
        // Leeg resultaat teruggeven is beter dan een fout
      }
      
      logInfo(`Aantal treinen ontvangen: ${treinen.length}`);
      // Cache de resultaten (zelfs als het leeg is)
      cache.put(cacheKey, JSON.stringify(treinen), CACHE_EXPIRATION_SEC);
      
      if (trainId) {
        treinen = treinen.filter(train => String(train.ritId) === String(trainId));
        logInfo(`Gefilterd op trein ${trainId}: ${treinen.length} resultaten`);
      }
      
      return treinen;
      
    } catch (error) {
      if (error.message && error.message.indexOf('timed out') !== -1) {
        logWarning(`NS API timeout - poging ${retries + 1}`, error);
        if (retries < MAX_RETRIES) {
          retries++;
          continue;
        }
        return handleApiError(ERROR_TYPES.TIMEOUT, 'API-verzoek timeout na meerdere pogingen');
      } else {
        logError(`Fout bij ophalen treinposities - poging ${retries + 1}`, error);
        if (retries < MAX_RETRIES) {
          retries++;
          continue;
        }
        return handleApiError(ERROR_TYPES.NETWORK, 'Netwerkfout bij verbinden met NS API na meerdere pogingen');
      }
    }
  }
}

/**
 * Standaardiseer API-foutafhandeling
 * @param {Object} errorType - Fouttype uit ERROR_TYPES
 * @param {string} detailedMessage - Gedetailleerde foutomschrijving
 * @return {Object} Gestandaardiseerd foutobject
 */
function handleApiError(errorType, detailedMessage) {
  return { 
    error: errorType.code, 
    message: errorType.message, 
    details: detailedMessage,
    timestamp: new Date().toISOString()
  };
}

/**
 * Haalt journey-details op voor een specifieke trein
 * @param {string} trainNumber - Treinnummer
 * @return {Object} Journey-details of foutobject
 */
function getJourneyDetails(trainNumber) {
  if (!trainNumber) {
    const error = 'Geen treinnummer opgegeven voor journey details';
    logError(error);
    return handleApiError(ERROR_TYPES.DATA_ERROR, error);
  }
  
  const cacheKey = "journey_" + trainNumber;
  const cache = CacheService.getScriptCache();
  let cached = cache.get(cacheKey);
  
  if (cached) {
    logInfo(`Journey details voor trein ${trainNumber} opgehaald uit cache`);
    try {
      return JSON.parse(cached);
    } catch (error) {
      logWarning(`Fout bij het parsen van gecachte journey details voor trein ${trainNumber}`, error);
      // Ga door met ophalen nieuwe data
    }
  }
  
  var apiKey = PropertiesService.getScriptProperties().getProperty("NS_API_KEY");
  if (!apiKey) {
    const error = 'NS API-sleutel ontbreekt. Configureer deze in de ScriptProperties.';
    logError(error);
    return handleApiError(ERROR_TYPES.AUTHENTICATION, error);
  }
  
  var url = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/journey?train=" + trainNumber + "&omitCrowdForecast=false";
  var options = {
    method: "get",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey
    },
    muteHttpExceptions: true
  };
  
  let retries = 0;
  while (retries <= MAX_RETRIES) {
    try {
      logInfo(`API-verzoek voor journey details (trein ${trainNumber}) - poging ${retries + 1}`);
      var response = UrlFetchApp.fetch(url, options);
      var responseCode = response.getResponseCode();
      
      if (responseCode !== 200) {
        // Afhandeling van verschillende HTTP-foutcodes (vergelijkbaar met getTreinPosities)
        if (responseCode === 401 || responseCode === 403) {
          const error = `Authenticatiefout bij NS API (${responseCode})`;
          logError(error);
          return handleApiError(ERROR_TYPES.AUTHENTICATION, error);
        } else if (responseCode === 429) {
          const error = `API-limiet overschreden (${responseCode})`;
          logWarning(error);
          if (retries < MAX_RETRIES) {
            retries++;
            Utilities.sleep(1000 * (retries * 2)); // Exponential backoff
            continue;
          }
          return handleApiError(ERROR_TYPES.RATE_LIMIT, error);
        } else if (responseCode >= 500) {
          const error = `NS API serverfout (${responseCode})`;
          logError(error);
          if (retries < MAX_RETRIES) {
            retries++;
            Utilities.sleep(1000); // Wacht 1 seconde voor retry
            continue;
          }
          return handleApiError(ERROR_TYPES.API_ERROR, error);
        } else {
          const error = `Onverwachte HTTP status: ${responseCode}`;
          logError(error);
          return handleApiError(ERROR_TYPES.API_ERROR, error);
        }
      }
      
      var responseText = response.getContentText();
      var data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        const errorMsg = `Fout bij het parsen van journey API-response voor trein ${trainNumber}`;
        logError(errorMsg, error);
        return handleApiError(ERROR_TYPES.DATA_ERROR, errorMsg);
      }
      
      var result = { nextStopDestination: "", delayInSeconds: 0 };
      
      // Probeer gegevens uit de response te extraheren
      try {
        if (data.payload && data.payload.stops && data.payload.stops.length > 1) {
          var nextStop = data.payload.stops[1];
          result.nextStopDestination = nextStop.destination || nextStop.name || "";
          
          if (nextStop.departures && nextStop.departures.length > 0) {
            result.delayInSeconds = nextStop.departures[0].delayInSeconds || 0;
          } else if (nextStop.arrivals && nextStop.arrivals.length > 0) {
            result.delayInSeconds = nextStop.arrivals[0].delayInSeconds || 0;
          }
        } else if (data.payload && data.payload.stops && data.payload.stops.length === 1) {
          // Laatste stop van de reis
          var lastStop = data.payload.stops[0];
          result.nextStopDestination = lastStop.name || "";
          result.isLastStop = true;
          
          if (lastStop.arrivals && lastStop.arrivals.length > 0) {
            result.delayInSeconds = lastStop.arrivals[0].delayInSeconds || 0;
          }
        } else {
          logWarning(`Onverwachte data-structuur voor trein ${trainNumber}: geen of lege stops array`);
        }
      } catch (error) {
        logWarning(`Fout bij het extraheren van journey gegevens voor trein ${trainNumber}`, error);
        // Ga door met het teruggeven van het (mogelijk lege) result object
      }
      
      // Voeg de plannedDuration toe als deze beschikbaar is
      if (data.payload && data.payload.plannedDurationInMinutes) {
        result.plannedDurationInMinutes = data.payload.plannedDurationInMinutes;
      }
      
      // Cache de resultaten
      cache.put(cacheKey, JSON.stringify(result), CACHE_EXPIRATION_SEC);
      return result;
      
    } catch (error) {
      if (error.message && error.message.indexOf('timed out') !== -1) {
        logWarning(`NS Journey API timeout - poging ${retries + 1}`, error);
        if (retries < MAX_RETRIES) {
          retries++;
          continue;
        }
        return handleApiError(ERROR_TYPES.TIMEOUT, `API-verzoek timeout voor trein ${trainNumber} na meerdere pogingen`);
      } else {
        logError(`Fout bij ophalen journey details voor trein ${trainNumber} - poging ${retries + 1}`, error);
        if (retries < MAX_RETRIES) {
          retries++;
          continue;
        }
        return handleApiError(ERROR_TYPES.NETWORK, `Netwerkfout bij verbinden met NS API voor trein ${trainNumber} na meerdere pogingen`);
      }
    }
  }
}

/**
 * Logging functie voor informatiemeldingen
 * @param {string} message - Bericht om te loggen
 */
function logInfo(message) {
  console.info(`[INFO] ${message}`);
}

/**
 * Logging functie voor waarschuwingen
 * @param {string} message - Bericht om te loggen
 * @param {Error} [error] - Optionele foutobject
 */
function logWarning(message, error) {
  if (error) {
    console.warn(`[WARNING] ${message} - ${error.message}`);
    console.warn(error.stack);
  } else {
    console.warn(`[WARNING] ${message}`);
  }
}

/**
 * Logging functie voor fouten
 * @param {string} message - Bericht om te loggen
 * @param {Error} [error] - Optionele foutobject
 */
function logError(message, error) {
  if (error) {
    console.error(`[ERROR] ${message} - ${error.message}`);
    console.error(error.stack);
  } else {
    console.error(`[ERROR] ${message}`);
  }
}
