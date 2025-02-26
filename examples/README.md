# LiveTreinen Apps Script - Voorbeelden

Deze map bevat codevoorbeelden voor het uitbreiden van de LiveTreinen-applicatie.

## Beschikbare voorbeelden

### 1. Een nieuwe functie toevoegen (ADD_NEW_FUNCTION.js)

Dit voorbeeld toont hoe je een nieuwe functie kunt toevoegen aan een bestaande module. In dit geval wordt een functie toegevoegd aan de ApiService-module om stationsinformatie op te halen van de NS API.

Belangrijke aspecten:
- Hoe je een nieuwe API-endpoint toevoegt aan Config.js
- Hoe je een nieuwe functie implementeert in de ApiService-module
- Hoe je een nieuwe API-route toevoegt aan de doGet-functie in Main.js

### 2. Een nieuwe module toevoegen (NEW_MODULE.js)

Dit voorbeeld toont hoe je een volledig nieuwe module kunt maken voor het verzamelen en analyseren van statistieken over treinbewegingen.

Belangrijke aspecten:
- Hoe je een nieuwe module structureert
- Hoe je functionaliteit implementeert die meerdere andere modules gebruikt
- Hoe je de nieuwe module integreert met bestaande code

## Gebruik van de voorbeelden

De voorbeelden zijn niet bedoeld om direct te kopiëren en plakken, maar dienen als illustratie van best practices voor het uitbreiden van de LiveTreinen-applicatie. Ze tonen de juiste aanpak voor het werken met de modulaire architectuur.

Bij het implementeren van nieuwe functionaliteit:

1. Bepaal eerst of de functionaliteit past binnen een bestaande module of een nieuwe module vereist
2. Volg de aanpak uit het relevante voorbeeld
3. Pas de code aan aan jouw specifieke behoeften
4. Test de code grondig voordat je deze in productie neemt

## Belangrijke overwegingen

- **Dependencies**: Houd rekening met de dependency-volgorde bij het deployen naar Apps Script
- **Caching**: Gebruik de CacheService-module voor het cachen van data om de API-belasting te verminderen
- **Foutafhandeling**: Gebruik de ErrorHandler-module voor consistente foutafhandeling
- **Documentatie**: Documenteer nieuwe code goed met JSDoc-commentaar

Zie [ARCHITECTURE.md](../ARCHITECTURE.md) en [DEPLOYMENT.md](../DEPLOYMENT.md) voor meer informatie over de architectuur en deployment-aanpak.
