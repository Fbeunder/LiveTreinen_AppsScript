# LiveTreinen Frontend

Deze directory bevat de frontend code voor de LiveTreinen applicatie, opgedeeld in logische modules voor betere onderhoudbaarheid en uitbreidbaarheid.

## Structuur

```
frontend/
├── css/           # CSS stylesheets
│   └── main.html  # Hoofdstylesheet
├── js/            # JavaScript modules
│   ├── app.html   # Applicatie entry point
│   ├── api.html   # API communicatie functies
│   ├── map.html   # Kaart en marker functionaliteit
│   ├── models.html # Data modellen en validaties
│   └── ui.html    # UI interacties en components
```

## Modules

### CSS

- **main.css**: Bevat alle styling voor de applicatie, inclusief kaart, controls, statusmeldingen, en cache-paneel.

### JavaScript

- **app.js**: Centrale module die de applicatie initialiseert en coördineert tussen de andere modules. Deze bevat de hoofdlogica en gegevensstroom.

- **models.js**: Definieert datamodellen en validaties voor treininformatie en journey details.

- **api.js**: Verantwoordelijk voor alle communicatie met de backend, inclusief het ophalen van treinposities, journey-details en cache-interacties.

- **map.js**: Beheert de Leaflet kaart, markers, popups en bijbehorende visuele elementen.

- **ui.js**: Behandelt alle gebruikersinterface elementen, zoals filters, error toast, en cache-statistiekenpaneel.

## Inclusion in Apps Script

De modules worden geladen in index.html met behulp van de Apps Script include functie:

```html
<!-- CSS -->
<?!= include('frontend/css/main'); ?>

<!-- JavaScript modules -->
<?!= include('frontend/js/models'); ?>
<?!= include('frontend/js/api'); ?>
<?!= include('frontend/js/map'); ?>
<?!= include('frontend/js/ui'); ?>
<?!= include('frontend/js/app'); ?>
```

Let op de volgorde van de JavaScript includes. Deze is belangrijk omdat er afhankelijkheden bestaan tussen de modules: 
- models.js bevat globale modeldefinities die andere modules nodig hebben
- api.js en map.js zijn nodig voor app.js, enz.

## Namespaces

Elke JavaScript module maakt gebruik van een modulair patroon met namespaces om conflicten te voorkomen:

- **App**: Hoofdmodule voor applicatiecoördinatie
- **Models**: Datamodellen en validatie
- **Api**: Backend communicatie 
- **Map**: Kaartfunctionaliteit
- **UI**: Gebruikersinterface interacties

## Modellering

Er worden verschillende datamodellen/interfaces gebruikt:
- **TrainModel**: Gegevens van individuele treinen (ritId, treinNummer, type, snelheid, positie)
- **JourneyModel**: Details over de reis van een trein (volgende halt, vertraging, etc.)
