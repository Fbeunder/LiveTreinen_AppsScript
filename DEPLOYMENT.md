# LiveTreinen Apps Script - Deployment Guide

Deze handleiding beschrijft hoe je de modulaire LiveTreinen-applicatie moet deployen naar Google Apps Script.

## Huidige situatie

De codebase is opgedeeld in verschillende modules voor betere onderhoudbaarheid en scheiding van verantwoordelijkheden:

- `Main.js` - Entry point voor de applicatie
- `ApiService.js` - API-communicatie
- `CacheService.js` - Caching-functionaliteit
- `ErrorHandler.js` - Foutafhandeling en logging
- `Config.js` - Configuratie-instellingen

Echter, Google Apps Script ondersteunt geen native JavaScript modules, en er is momenteel geen geautomatiseerd buildproces. Daarom moet je de volgende handmatige stappen volgen.

## Deployment Opties

### Optie 1: Handmatige deployment (aanbevolen voor nu)

1. **Creëer een nieuw Google Apps Script project**:
   - Ga naar [script.google.com](https://script.google.com/)
   - Klik op "Nieuw project"

2. **Upload de bestanden**:
   - Kopieer de inhoud van elk bestand en voeg het toe in het Google Apps Script project
   - Creëer eerst bestand `Code.js` (is nodig voor de doGet function)
   - Daarna alle modules in deze volgorde: `Config.js`, `ErrorHandler.js`, `CacheService.js`, `ApiService.js`, `Main.js`

3. **Configureer de API-sleutel**:
   - Ga naar "Project Settings" > "Script Properties"
   - Voeg een eigenschap toe met naam `NS_API_KEY` en je NS API-sleutel als waarde

4. **Upload de HTML-bestanden**:
   - Kopieer de inhoud van `Index.html` en voeg het toe als HTML-bestand

5. **Stel de uitvoeringsrechten in**:
   - Klik op "Deploy" > "New deployment"
   - Kies "Web app" als type
   - Stel "Who has access" in op de gewenste doelgroep (bijv. "Anyone")
   - Klik op "Deploy"

6. **Autoriseer de nodige toestemmingen**:
   - Bij het eerste gebruik zal je gevraagd worden om de nodige machtigingen toe te staan

### Optie 2: Geautomatiseerde deployment met clasp (toekomstig)

Voor een geautomatiseerde workflow kan [clasp](https://github.com/google/clasp) worden gebruikt. 
Dit wordt momenteel onderzocht en zal in een toekomstige update worden geïmplementeerd.

## Testen na deployment

Na de deployment moet je controleren of alles goed werkt:

1. **Basis functionaliteit**:
   - Open de gedeployde webapplicatie-URL
   - Controleer of de kaart wordt geladen
   - Controleer of er treinen worden weergegeven

2. **API-integratie**:
   - Zoek een specifiek treinnummer
   - Controleer of de treindetails correct worden weergegeven

3. **Foutafhandeling**:
   - Test het gedrag wanneer de API-sleutel ontbreekt of ongeldig is
   - Controleer of de foutmeldingen correct worden weergegeven

## Veelvoorkomende problemen

### Modules worden niet correct geladen

**Symptoom**: Je krijgt fouten zoals "getTreinPosities is not defined"

**Oplossing**: Zorg ervoor dat je alle bestanden in de juiste volgorde hebt toegevoegd. De afhankelijkheden moeten in de juiste volgorde worden geladen, beginnend met `Config.js`.

### Inconsistente caching

**Symptoom**: Oude gegevens worden getoond of API-verzoeken lijken niet te werken

**Oplossing**: Wis de cache in het Apps Script-project. Ga naar "Project Settings" > "Script Properties" en verwijder alle bestaande cachewaarden.

### API-sleutel problemen

**Symptoom**: Je krijgt authenticatiefouten van de NS API

**Oplossing**: Controleer of de API-sleutel correct is ingesteld in de Script Properties. Controleer ook of de sleutel nog geldig is en de juiste machtigingen heeft.

## Extra informatie

### Ondersteuning voor Apps Script-modules

Google Apps Script heeft geen native ondersteuning voor ES6-modules of CommonJS-modules. In plaats daarvan wordt alle code in de globale scope uitgevoerd in de volgorde waarin de bestanden zijn toegevoegd aan het project.

### Toekomstige verbeteringen

Er loopt een onderzoek naar een betere moduleringsstrategie. Opties zijn:

1. Een bundler-script dat alle modules samenvoegt in één bestand
2. Een clasp-gebaseerde workflow met pre-processing
3. Closure Compiler voor optimalisatie en bundeling

Zie issue #3 voor meer details over deze ontwikkeling.
