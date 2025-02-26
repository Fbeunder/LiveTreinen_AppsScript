# Deployment Instructies

Dit document beschrijft hoe je de LiveTreinen_AppsScript code kunt deployen naar Google Apps Script.

## Stap 1: Ga naar het Google Apps Script project

1. Log in bij Google en ga naar [Google Apps Script](https://script.google.com/)
2. Open het project met ID `1EVkPWScAsUenvx7cZBDdr-6yKmZh_nZq7QZnZtAUjIb0ZJ5yemckku4t`
   - Als je geen toegang hebt tot dit specifieke project, maak dan een nieuw project aan.

## Stap 2: Bestanden toevoegen

### Backend bestanden

Voeg de volgende backend bestanden toe aan het project:

1. **Main.js** - Bevat de `doGet` functie en hoofdlogica
2. **ApiService.js** - Bevat API-communicatie functies
3. **CacheService.js** - Bevat caching mechanismen
4. **ErrorHandler.js** - Bevat foutafhandeling functies
5. **Config.js** - Bevat configuratie-instellingen

Voor elk bestand:
1. Klik op het + naast "Bestanden" in het linkerpaneel
2. Kies "Script"
3. Geef het bestand de juiste naam
4. Kopieer en plak de inhoud uit de repository

### Frontend bestanden

Voeg de volgende frontend bestanden toe:

1. **Index.html** - Hoofdbestand
2. **frontend/css/main.html** - CSS voor de applicatie
3. **frontend/js/models.html** - Data models module
4. **frontend/js/api.html** - API communicatie module
5. **frontend/js/map.html** - Kaart functionaliteit
6. **frontend/js/ui.html** - UI componenten
7. **frontend/js/app.html** - App controller

Voor elk HTML-bestand:
1. Klik op het + naast "Bestanden" in het linkerpaneel
2. Kies "HTML"
3. Geef het bestand de juiste naam (zonder .html extensie)
   - Voor Index.html kies je "Index"
   - Voor frontend/css/main.html kies je "frontend/css/main"
   - etc.
4. Kopieer en plak de inhoud uit de repository

### Manifest bestand

1. Open het bestand `appsscript.json` in het Apps Script project
2. Kopieer en plak de inhoud van het appsscript.json bestand uit de repository

## Stap 3: Configureren van de NS API-sleutel

1. Klik op het tandwiel icoon (⚙️) in het linkerpaneel om naar de projectinstellingen te gaan
2. Klik op "Scripteigenschappen"
3. Voeg een nieuwe eigenschap toe met naam `NS_API_KEY` en de waarde van je NS API-sleutel

## Stap 4: Testen van de applicatie

1. Klik op de "Opslaan" knop om alle wijzigingen op te slaan
2. Klik op "Debug" of "Test" om de applicatie te testen
3. Controleer of de applicatie correct wordt geladen en de treinposities worden weergegeven

## Stap 5: Deployen van de applicatie

1. Klik op "Implementeren" > "Nieuwe implementatie" in de toolbar
2. Selecteer "Web app" als type implementatie
3. Geef een beschrijving voor de implementatie, bijvoorbeeld "LiveTreinen v1.0"
4. Configureer de toegangsrechten:
   - Execute as: "Me" (of de gewenste account)
   - Who has access: "Anyone" voor openbare toegang, of "Anyone with Google account" voor beperkte toegang
5. Klik op "Implementeren"
6. Kopieer de deployment URL die wordt weergegeven voor toegang tot de applicatie

## Stap 6: Bijwerken van de README

1. Update de README.md van het project met de deployment URL
2. Voeg eventuele specifieke instructies toe voor gebruikers van de applicatie

## Opmerkingen

- Zorg ervoor dat je de NS API-sleutel geheim houdt en niet deelt in publieke repositories
- De applicatie vereist de volgende OAuth scopes, die automatisch worden geconfigureerd:
  - `https://www.googleapis.com/auth/script.external_request` (Voor het maken van externe API requests)
  - `https://www.googleapis.com/auth/script.scriptapp` (Voor het uitvoeren van het script als web-app)
