/**
 * LiveTreinen_AppsScript - Error Handler Module
 * Bevat functies voor het standaardiseren van foutafhandeling en logging
 */

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
 * Maakt een gestandaardiseerd foutantwoord voor HTTP responses
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