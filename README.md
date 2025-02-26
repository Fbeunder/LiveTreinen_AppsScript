# LiveTreinen Apps Script

Een Google Apps Script project dat realtime treinposities en -informatie van de NS API ophaalt en visualiseert op een interactieve kaart.

## Functionaliteiten

- Tonen van actuele treinposities op een interactieve kaart
- Filteren op treinnummer
- Detailinformatie per trein (type, snelheid, volgende halte, vertraging)
- Volgmodus voor specifieke treinen
- Weergave van vertragingen met kleurcodering
- Responsief design voor desktop en mobiel

## Architectuur

Het project is modulair opgezet met de volgende modules:

- **Main.js** - Hoofdmodule met doGet-functie en algemene logica
- **ApiService.js** - Module voor het afhandelen van API-communicatie met NS API
- **CacheService.js** - Module voor het afhandelen van caching
- **ErrorHandler.js** - Module voor foutafhandeling en -logging
- **Config.js** - Module voor configuratie-instellingen

## Benodigdheden

Om deze applicatie te gebruiken heb je nodig:
- Een Google account
- Toegang tot Google Apps Script
- Een NS API-sleutel (te verkrijgen via de NS API Portal)

## Installatie

1. Kopieer de bestanden naar je Google Apps Script project
2. Configureer je NS API-sleutel in de Script Properties
   - Ga naar 'Project Settings'
   - Klik op 'Script Properties'
   - Voeg een eigenschap toe met naam 'NS_API_KEY' en je NS API-sleutel als waarde
3. Implementeer het script als web-app (Deploy > New deployment > Web app)
4. Geef de benodigde autorisaties

## API Documentatie

Deze applicatie maakt gebruik van:
- NS Virtual Train API voor treinposities
- NS Journey API voor reisinformatie

## Ontwikkelaars Info

De applicatie is modulair opgezet en maakt gebruik van:
- Google Apps Script services (CacheService, PropertiesService)
- Leaflet.js voor kaartintegratie
- Bootstrap voor responsive UI
- Retries en cache voor betrouwbare operatie

## Licentie

Dit project is beschikbaar onder de MIT-licentie.
