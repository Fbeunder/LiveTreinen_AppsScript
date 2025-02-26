/**
 * LiveTreinen_AppsScript - API Service Module
 * Bevat functies voor het communiceren met externe API's
 */

/**
 * Haalt de NS API-sleutel op uit de script properties
 * @return {string|null} NS API-sleutel of null als deze niet geconfigureerd is
 */
function getNsApiKey() {
  const apiKey = PropertiesService.getScriptProperties().getProperty("NS_API_KEY");
  if (!apiKey) {
    const error = 'NS API-sleutel ontbreekt. Configureer deze in de ScriptProperties.';
    logError(error);
    return null;
  }
  return apiKey;
}

/**
 * Voert een HTTP-request uit naar de NS API met retry-mechanisme
 * @param {string} url - API-endpoint URL
 * @param {Object} options - HTTP-request opties
 * @param {string} resourceName - Naam van de resource voor logging (bijv. 'treinposities')
 * @return {Object} Response data of een foutobject
 */
function makeApiRequest(url, options, resourceName) {
  let retries = 0;
  while (retries <= MAX_RETRIES) {
    try {
      logInfo(`API-verzoek voor ${resourceName} - poging ${retries + 1}`);
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
        const errorMsg = `Fout bij het parsen van API-response voor ${resourceName}`;
        logError(errorMsg, error);
        return handleApiError(ERROR_TYPES.DATA_ERROR, errorMsg);
      }
      
      return data;
      
    } catch (error) {
      if (error.message && error.message.indexOf('timed out') !== -1) {
        logWarning(`NS API timeout - poging ${retries + 1}`, error);
        if (retries < MAX_RETRIES) {
          retries++;
          continue;
        }
        return handleApiError(ERROR_TYPES.TIMEOUT, `API-verzoek timeout voor ${resourceName} na meerdere pogingen`);
      } else {
        logError(`Fout bij ophalen ${resourceName} - poging ${retries + 1}`, error);
        if (retries < MAX_RETRIES) {
          retries++;
          continue;
        }
        return handleApiError(ERROR_TYPES.NETWORK, `Netwerkfout bij verbinden met NS API voor ${resourceName} na meerdere pogingen`);
      }
    }
  }
}

/**
 * Haalt treinposities op van de NS API
 * @param {string|null} trainId - Optioneel treinnummer om te filteren
 * @return {Object[]} Array met treinposities of foutobject
 */
function getTreinPosities(trainId) {
  const cacheKey = "trainPositions" + (trainId ? "_" + trainId : "");
  
  return getOrFetchData(cacheKey, function() {
    var apiKey = getNsApiKey();
    if (!apiKey) {
      return handleApiError(ERROR_TYPES.AUTHENTICATION, 'NS API-sleutel ontbreekt');
    }
    
    var options = {
      method: "get",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey
      },
      muteHttpExceptions: true
    };
    
    const data = makeApiRequest(NS_TRAIN_API_ENDPOINT, options, "treinposities");
    
    // Controleer op fouten in de API-response
    if (data.error) {
      return data; // Geef foutobject terug
    }
    
    // Verwerk de trains data
    let treinen = [];
    if (data.payload && data.payload.treinen) {
      treinen = data.payload.treinen;
    } else {
      const warning = 'Geen treingegevens in API-response of onverwachte responsestructuur';
      logWarning(warning);
      // Leeg resultaat teruggeven is beter dan een fout
    }
    
    logInfo(`Aantal treinen ontvangen: ${treinen.length}`);
    
    // Filter op treinID als dat is opgegeven
    if (trainId) {
      treinen = treinen.filter(train => String(train.ritId) === String(trainId));
      logInfo(`Gefilterd op trein ${trainId}: ${treinen.length} resultaten`);
    }
    
    return treinen;
  });
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
  
  return getOrFetchData(cacheKey, function() {
    var apiKey = getNsApiKey();
    if (!apiKey) {
      return handleApiError(ERROR_TYPES.AUTHENTICATION, 'NS API-sleutel ontbreekt');
    }
    
    var url = `${NS_JOURNEY_API_ENDPOINT}?train=${trainNumber}&omitCrowdForecast=false`;
    var options = {
      method: "get",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey
      },
      muteHttpExceptions: true
    };
    
    const data = makeApiRequest(url, options, `journey details (trein ${trainNumber})`);
    
    // Controleer op fouten in de API-response
    if (data.error) {
      return data; // Geef foutobject terug
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
    
    return result;
  });
}