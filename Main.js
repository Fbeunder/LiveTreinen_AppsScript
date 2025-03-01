/**
 * LiveTreinen_AppsScript - Hoofdmodule
 * Bevat de doGet entry-point en coördineert de applicatie
 */

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
    } else if (e.parameter && e.parameter.action == "getCacheStats") {
      // Endpoint voor het ophalen van cache-statistieken
      var stats = getCacheStatistics();
      return ContentService.createTextOutput(JSON.stringify(stats))
                           .setMimeType(ContentService.MimeType.JSON);
    } else if (e.parameter && e.parameter.action == "resetCacheStats") {
      // Endpoint voor het resetten van cache-statistieken
      var result = resetCacheStatistics();
      return ContentService.createTextOutput(JSON.stringify(result))
                           .setMimeType(ContentService.MimeType.JSON);
    } else if (e.parameter && e.parameter.action == "refreshTrainData") {
      // Endpoint voor het geforceerd vernieuwen van data voor een specifieke trein
      var trainNumber = e.parameter.train;
      if (!trainNumber) {
        return createErrorResponse('Geen treinnummer opgegeven', 400);
      }
      var result = refreshTrainData(trainNumber);
      return ContentService.createTextOutput(JSON.stringify(result))
                           .setMimeType(ContentService.MimeType.JSON);
    } else if (e.parameter && e.parameter.action == "checkCache") {
      // Endpoint voor het controleren of data voor een trein in cache zit
      var trainNumber = e.parameter.train;
      if (!trainNumber) {
        return createErrorResponse('Geen treinnummer opgegeven', 400);
      }
      var hasFresh = hasFreshCache(trainNumber);
      return ContentService.createTextOutput(JSON.stringify({
        trainNumber: trainNumber,
        hasFreshCache: hasFresh
      })).setMimeType(ContentService.MimeType.JSON);
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