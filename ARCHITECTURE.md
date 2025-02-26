# LiveTreinen Apps Script - Architectuur

Dit document beschrijft de modulaire architectuur van de LiveTreinen Apps Script applicatie.

## Overzicht

De applicatie is opgedeeld in verschillende functionele modules om de code beter onderhoudbaar te maken en een duidelijke scheiding van verantwoordelijkheden te realiseren.

```
+-------------+       +-------------+       +--------------+
|    Main     |------>| ApiService  |------>| CacheService |
+-------------+       +-------------+       +--------------+
      |                     |                      ^
      v                     v                      |
+-------------+      +---------------+             |
| ErrorHandler|<-----| Config        |-------------+
+-------------+      +---------------+
```

## Modules en verantwoordelijkheden

### Main.js
- **Doel**: Entry point voor de applicatie, afhandeling van HTTP-verzoeken
- **Verantwoordelijkheden**: 
  - Routeren van API-verzoeken naar de juiste handlers
  - Serveren van de HTML-interface
  - Coördineren tussen verschillende modules
- **Belangrijkste functies**:
  - `doGet(e)`: Apps Script web app entry point

### ApiService.js
- **Doel**: Communicatie met de NS API
- **Verantwoordelijkheden**:
  - Maken van HTTP-verzoeken naar de NS API
  - Verwerken van API-responses
  - Afhandelen van API-specifieke fouten
- **Belangrijkste functies**:
  - `getTreinPosities(trainId)`: Ophalen van treinposities
  - `getJourneyDetails(trainNumber)`: Ophalen van reisinformatie
  - `makeApiRequest(url, options, resourceName)`: Generieke API-requestfunctie met retry

### CacheService.js
- **Doel**: Caching van API-responses voor betere performance
- **Verantwoordelijkheden**:
  - Cachen van veelgevraagde data
  - Cache invalidatie
  - Efficiënt gebruik van Google's CacheService
- **Belangrijkste functies**:
  - `getOrFetchData(cacheKey, fetchFunction, expirationSec)`: Universele cache/fetch functie

### ErrorHandler.js
- **Doel**: Centrale foutafhandeling en logging
- **Verantwoordelijkheden**:
  - Standaardiseren van foutberichten
  - Logging van verschillende fouttypen
  - Creëren van gebruikersvriendelijke foutresponses
- **Belangrijkste functies**:
  - `logInfo/Warning/Error()`: Logging-functies
  - `handleApiError()`: Standaardisatie van API-fouten
  - `createErrorResponse()`: Genereren van HTTP-foutresponses

### Config.js
- **Doel**: Centrale configuratie voor de hele applicatie
- **Verantwoordelijkheden**:
  - Definiëren van constanten en configuratieparameters
  - Bieden van een enkele plek voor het wijzigen van gedrag
- **Belangrijkste instellingen**:
  - API-endpoints
  - Timeout-waarden
  - Cache-levensduur
  - Foutdefinities

## Ontwerppatronen

### Dependency Injection
De modules zijn zo opgezet dat ze expliciet afhankelijkheden aanroepen, waardoor testbaarheid wordt verbeterd en circulaire afhankelijkheden worden voorkomen.

### Separation of Concerns
Elke module heeft een specifieke verantwoordelijkheid, waardoor de code beter onderhoudbaar is.

### Caching Layer
Het caching-mechanisme is geïsoleerd in een eigen module, zodat de cachelogica aangepast kan worden zonder de rest van de applicatie te beïnvloeden.

### Central Configuration
Alle configuratieparameters zijn gecentraliseerd in Config.js, wat het makkelijker maakt om het gedrag van de applicatie aan te passen.

## Richtlijnen voor uitbreidingen

### Een nieuwe functie toevoegen:
1. Bepaal welke module verantwoordelijk moet zijn voor de functie
2. Implementeer de functie in die module
3. Update de documentatie

### Een nieuwe module toevoegen:
1. Creëer een nieuw JS-bestand met een descriptieve naam (bijv. `StatisticsService.js`)
2. Definieer de verantwoordelijkheden van de module in de header commentaar
3. Zorg dat functies logisch gegroepeerd zijn
4. Update dit document met de nieuwe module-informatie

### Een bestaande module wijzigen:
1. Houd je aan de bestaande conventies in die module
2. Voeg commentaar toe voor nieuwe functies
3. Beperk wijzigingen aan de publieke interface zo veel mogelijk

## Deployment
Zie [DEPLOYMENT.md](DEPLOYMENT.md) voor instructies over hoe deze modulaire code in Google Apps Script te deployen.
