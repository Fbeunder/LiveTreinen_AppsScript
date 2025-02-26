# LiveTreinen Apps Script

Een Google Apps Script project dat realtime treinposities en -informatie van de NS API ophaalt en visualiseert op een interactieve kaart.

## Functionaliteiten

- Tonen van actuele treinposities op een interactieve kaart
- Filteren op treinnummer
- Detailinformatie per trein (type, snelheid, volgende halte, vertraging)
- Volgmodus voor specifieke treinen
- Weergave van vertragingen met kleurcodering
- Responsief design voor desktop en mobiel
- Geavanceerde caching voor optimale performance
- Real-time cache statistieken en verversing van data

## Architectuur

Het project is volledig modulair opgezet met de volgende onderdelen:

### Backend (Google Apps Script)
- **Main.js** - Hoofdmodule met doGet-functie en algemene logica
- **ApiService.js** - Module voor het afhandelen van API-communicatie met NS API
- **CacheService.js** - Module voor het afhandelen van geavanceerde caching
- **ErrorHandler.js** - Module voor foutafhandeling en -logging
- **Config.js** - Module voor configuratie-instellingen

### Frontend (Modulaire JavaScript)
- **index.html** - Hoofdbestand met basisstructuur en imports
- **css/main.html** - Centrale stylesheet
- **js/models.html** - Data models en validaties
- **js/api.html** - API communicatie functies
- **js/map.html** - Kaart en marker beheer
- **js/ui.html** - UI componenten en interacties
- **js/app.html** - Main application controller

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

## Technische Specificaties

- **Programmeertaal**: JavaScript (Google Apps Script)
- **Versie**: 1.0.0
- **Script ID**: AKfycbyGbGRas6dTNB8aFcv7Z62kNpq6RRdEanjkrvXXX9rHihmFV-Wy-oBrM_GqXbN0FNgP
- **Frontend Libraries**:
  - Leaflet.js v1.9.4 voor kaartintegratie
  - Bootstrap v4.5.2 voor responsive UI
  - jQuery v3.5.1 voor DOM manipulatie
  - Font Awesome v5.15.4 voor iconen
- **Backend Features**:
  - Gedifferentieerde caching per data type
  - Robuuste error handling met retry mechanisme
  - Auto-scaling cache TTLs

## Ontwikkelaars Informatie

De applicatie is volledig modulair opgezet en maakt gebruik van:
- Google Apps Script services (CacheService, PropertiesService)
- Namespaces voor het vermijden van conflicten
- JSDoc documentatie voor alle modules en functies
- Gestandaardiseerde foutafhandeling en logging

## Licentie

Dit project is beschikbaar onder de MIT-licentie.
