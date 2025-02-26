/**
 * VOORBEELD: Een nieuwe functie toevoegen aan ApiService.js
 * 
 * Dit voorbeeld toont hoe je een nieuwe functie kunt toevoegen aan een bestaande module
 * In dit geval: Een functie om stationsinformatie op te halen uit de NS API
 */

// ========== VOEG DIT TOE AAN ApiService.js ==========

/**
 * Haalt stationsinformatie op van de NS API
 * @param {string} [stationCode] - Optionele stationscode om te filteren (bijv. "UT" voor Utrecht)
 * @return {Object[]} Array met stations of foutobject
 */
function getStationsInformatie(stationCode) {
  const cacheKey = "stations" + (stationCode ? "_" + stationCode : "");
  
  return getOrFetchData(cacheKey, function() {
    var apiKey = getNsApiKey();
    if (!apiKey) {
      return handleApiError(ERROR_TYPES.AUTHENTICATION, 'NS API-sleutel ontbreekt');
    }
    
    // Pas de API Endpoint URL aan in Config.js
    // NS_STATION_API_ENDPOINT = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations"
    
    var url = NS_STATION_API_ENDPOINT + (stationCode ? "?code=" + stationCode : "");
    var options = {
      method: "get",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey
      },
      muteHttpExceptions: true
    };
    
    const data = makeApiRequest(url, options, "stationsinformatie");
    
    // Controleer op fouten in de API-response
    if (data.error) {
      return data; // Geef foutobject terug
    }
    
    // Verwerk de stations data
    let stations = [];
    if (data.payload && data.payload.stations) {
      stations = data.payload.stations;
    } else {
      const warning = 'Geen stationsgegevens in API-response of onverwachte responsestructuur';
      logWarning(warning);
      // Leeg resultaat teruggeven is beter dan een fout
    }
    
    logInfo(`Aantal stations ontvangen: ${stations.length}`);
    
    return stations;
  }, 3600); // Stationsinformatie kan langer gecached worden (3600 sec = 1 uur)
}

// ========== VOEG DIT TOE AAN Config.js ==========

// Voeg deze regel toe aan de API-endpoints sectie in Config.js
const NS_STATION_API_ENDPOINT = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations";

// ========== VOEG DIT TOE AAN Main.js (doGet functie) ==========

// Voeg deze case toe in de doGet functie:
else if (e.parameter && e.parameter.action == "getStations") {
  // Endpoint voor het ophalen van stationsinformatie
  const stationCode = e.parameter.stationCode || null;
  const data = getStationsInformatie(stationCode);
  return ContentService.createTextOutput(JSON.stringify(data))
                       .setMimeType(ContentService.MimeType.JSON);
}
