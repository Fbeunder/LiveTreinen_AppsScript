// LEGACY FILE - Code is nu opgesplitst in losse modules
// Zie Main.js, ApiService.js, ErrorHandler.js, CacheService.js en Config.js

/**
 * Stub-implementatie om compatibiliteit te waarborgen
 * Deze functie zorgt ervoor dat bestaande koppelingen blijven werken
 * door doGet door te sturen naar de nieuwe Main.js implementatie.
 */
function doGet(e) {
  // Redirect naar de nieuwe implementatie
  return Main.doGet(e);
}