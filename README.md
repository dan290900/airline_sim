# Lufthansa Group Manager · Operations Edition

Ein lokaler Airline-Manager für die Lufthansa Group. `index.html` in einem aktuellen Browser öffnen oder den Ordner über einen lokalen HTTP-Server bereitstellen. Es sind keine Installation, Anmeldung, Internetverbindung oder Serverdatenbank erforderlich. Basisgrafiken, Icons und Kartendaten sind lokal enthalten. Original-Flugzeugabbildungen werden optional von den offiziellen Airline-Seiten geladen; offline bleiben die lokalen Ersatzgrafiken verfügbar. Es gibt keine Premiumwährung, Werbung, bezahlten Vorteile oder käuflichen Zeitbeschleuniger.

## Neu in der Operations Edition

- Eigenes Operations Center in Navy, Weiß und Lufthansa-Gelb; lokale Flugzeuggrafiken, geografische Weltkarte, Europaansicht und anklickbare Verbindungen.
- Abflug-/Ankunftstafel, individuelle Flugzeugkennungen, Flottenkarten und Statusanzeigen.
- Acht spielbare Gesellschaften: Lufthansa, SWISS, Austrian Airlines, Brussels Airlines, Eurowings, Discover Airlines, Edelweiss und Air Dolomiti, mit definierten Hubs/Basen.
- Streckenplaner mit Live-Prognose, Flugzeugvergleich, Reichweitenreserve, begrenzten freien Maschinen, Serviceprofilen, Bodenpuffer und optionalem täglichem Umlaufziel.
- Streckensteuerung mit Kostenrechnung, Break-even-Auslastung, Rivalenpreisen und Marktanteilen.
- Vierstündige Technik-Checks mit tatsächlicher Standzeit; Nachtflugruhe an FRA/MUC/ZRH mit Ortszeit und Sommerzeit.
- Veränderlicher Kerosinpreis, synthetische Wetterverzögerungen, Zuverlässigkeit und begrenzte Nachfrage.
- Cashflowberichte, Tageshistorie, Buchungsjournal und verzinste Kreditlinie.
- Beschaffung neuer und gebrauchter Flugzeuge, Lieferfristen, Verkauf freier Maschinen und geordnete Streckenstilllegung.
- Management Academy, situationsbezogenes Briefing und Erklärungen an den relevanten Entscheidungen.

## Handyansicht

Bis 640 Pixel Bildschirmbreite gibt es eine feste Navigation am unteren Rand: Übersicht, Netz, Planen, Flotte und Mehr. Das Mehr-Menü enthält Finanzen, Betrieb, Wettbewerb, Group, Academy und Spielstand. Tabellen erscheinen als beschriftete Karten, Formulare stehen untereinander und Eingabefelder verwenden mindestens 16 Pixel Schrift gegen ungewolltes Zoom auf iPhones. Die Navigation berücksichtigt den unteren Sicherheitsabstand des Geräts. Offene Menüs und fokussierte Eingaben werden durch die periodische Aktualisierung nicht ersetzt.

Der Browser-Test prüft die Seiten mit Touch-Emulation bei 280, 320, 360, 390, 430 und 640 Pixel Breite, Querformate bis 1024 Pixel, seitlich herausragende Bedienelemente, horizontale Scrollbereiche und die Erhaltung von Menüs und Formulareingaben während laufender Simulation.

## Szenario und Lufthansa-Group-Bezug

Ein neues Szenario startet mit einer verdichteten, modellierten Flotte von 140 Flugzeugen, 64 Märkten, 900 Mio. € Liquidität und 8,5 Mio. Litern Kerosin. Diese Zahlen sind **keine vollständige reale Konzernflotte und keine aktuellen Unternehmensdaten**. Die Verdichtung macht die Managemententscheidungen einer Gruppe lokal spielbar. Vorhandene Spielstände werden nicht auf diese Startwerte zurückgesetzt.

Lufthansa nutzt FRA/MUC, SWISS ZRH, Austrian VIE, Brussels BRU, Eurowings DUS/HAM/BER, Discover FRA/MUC, Edelweiss ZRH und Air Dolomiti MUC/FRA als Szenariobasen. ITA Airways wird als Konzernbeteiligung erwähnt und nicht separat gesteuert. CityLine und City Airlines sind im Lufthansa-Betrieb zusammengefasst; Cargo und Technik sind keine eigenen Profitcenter.

Airline-Namen und Hub-Struktur orientieren sich an den offiziellen Group-Seiten. Flotten, Nachfrage, Marktangebote, Kosten, Preise und Lieferzeiten sind Spielmodelle. Die Darstellung ist eine inoffizielle Simulation ohne Verbindung zum realen Flugbetrieb.

## Spieluhr und Ereignisse

Die feste Spieluhr läuft mit Faktor 12: fünf reale Minuten sind eine Spielstunde, zwei reale Stunden ein Spieltag. Nach dem Schließen läuft kein Prozess auf einem Server weiter. Beim Wiederöffnen wird die vergangene Zeit anhand der gespeicherten Gerätezeit für alle Unternehmen nachgerechnet.

Der Ereignisablauf verarbeitet Starts, Landungen, Auslieferungen, Technikfreigaben, halbstündliche Betriebskontrollen und sechsstündliche Marktreaktionen in zeitlicher Reihenfolge. Aktives Spielen und ein einmaliges Nachholen derselben Zeit ergeben denselben Simulationszustand. Sehr lange Abwesenheiten benötigen mehr Rechenzeit. Eine rückwärts gestellte Uhr erzeugt keinen zusätzlichen Fortschritt.

Eine neue Strecke beginnt nach 30 Spielminuten Vorbereitung, vorbehaltlich Nachtflugruhe. Flugzeit ist eine modellierte Blockzeit mit Zuschlag für Bodenrollen/Steigflug und reduzierter Durchschnittsgeschwindigkeit. Flugzeuge fliegen abwechselnd hin und zurück. Die Bodenzeit beträgt 45 Minuten auf kleinen, 90 Minuten auf großen und 120 Minuten auf sehr großen Mustern, zuzüglich des gewählten Puffers. Ein optionales Umlaufziel kann weitere Standzeit erzeugen; physikalisch zu enge Ziele werden abgelehnt.

Am Start werden Nachfrage, Ticketumsatz und Kosten für den Flug festgeschrieben, Kerosin abgezogen und variable Kosten bezahlt. Erst bei der Landung werden die gebuchten Erlöse gutgeschrieben. Preisänderungen schreiben daher laufende Flüge nicht rückwirkend um. Bei fehlendem Kerosin oder Zustand bis 50 % startet die Maschine nicht, bleibt am selben Flughafen und versucht es später wieder. Es gibt keinen Scheinflug zum nächsten Ziel.

Für Starts und geplante Landungen gelten vereinfachte Kernzeiten: FRA 23–05 Uhr, MUC 00–05 Uhr, ZRH 23–06 Uhr in jeweiliger Ortszeit, einschließlich Sommerzeit. Ausnahmen und Nachtrandkontingente werden nicht simuliert. Synthetische Wetterverzögerungen sind keine echten Wetterdaten; mögliche Ausnahmegenehmigungen nach Verspätungen werden ebenfalls nicht einzeln berechnet.

## Nachfrage, Service und Konkurrenz

Die zehn KI-Airlines teilen sich mit deinen Angeboten einen endlichen Nachfragemarkt. Preis, Serviceprofil, Airline-Profil, Zuverlässigkeit und Kapazität beeinflussen die Wahl; ein Teil der Reisenden fliegt nicht. Wochentage, Saison und simulierte Wetterlagen verändern die Nachfrage. Eigene Group-Airlines können einander auf denselben Märkten kannibalisieren. Hin- und Rückrichtung sind zu einem Nachfragemarkt zusammengefasst; ein vollständiges Umsteigermodell ist noch nicht enthalten.

Classic, Premium und Light ändern die Attraktivität und die Kosten pro Gast. Die Streckenprognose berechnet eine Modellwoche mit beiden Richtungen und Nachtflugruhe. Sie nutzt die aktuellen Angebote und Kerosinpreise und ist keine Gewinngarantie. Zusätzliche Technikstandzeiten und zukünftige Marktveränderungen sind darin nicht vorweggenommen.

Rivalen absolvieren zusammengefasste Flugumläufe und tragen variable Flugkosten, Kerosin- und Flottenfixkosten. Alle sechs Spielstunden reagieren sie mit Preisen und Kapazität. Jeden Spieltag sind Eintritte und Rückzüge möglich. Bei positivem Ergebnis und ausreichend Kapital können sie bis zu drei Flugzeuge für je 65 Mio. € kaufen; danach müssen mindestens 400 Mio. € verbleiben. Kapazitätsausbau benötigt freien Flottenbestand. Die Konkurrenzübersicht zeigt Flotte, Wachstum, Märkte, kumulierte Flüge, Liquidität und das zuletzt auf einen Spieltag hochgerechnete Ergebnis. Rivalen haben kein vollständiges Einzel-Flugzeugregister; Insolvenzen sind nicht modelliert.

## Technik, Dauerbetrieb und Beschaffung

Unter 72 % Zustand plant die standardmäßig aktive Technikautomatik einen Check. Bereits gestartete Flüge landen zuerst, neue Starts des Musters warten. Sobald alle betroffenen Maschinen am Boden sind und genug Geld verfügbar ist, beginnt der vierstündige Check. Der Zustand steigt erst bei der Freigabe auf 100 %. Zustand und Check werden weiterhin nach Airline/Flugzeugtyp gruppiert verwaltet.

Der automatische Kerosinkauf füllt bei weniger als einem halben geplanten Tag Vorrat auf einen ganzen Tag auf. Beide Automatiken lassen 100 Mio. € Liquiditätsreserve stehen und können unter „Spielstand & Dauerbetrieb“ einzeln abgeschaltet werden. Personal, Flottenfixkosten und Zinsen laufen weiter. Automatik garantiert deshalb keine Solvenz.

Neubestellungen werden sofort bezahlt und in 7–14 Spieltagen geliefert. Gebrauchte Maschinen kosten 72 % des modellierten Neupreises, kommen nach einem Spieltag und mit 84 % Zustand. Bei Lieferung in ein bestehendes Flottenmuster wird dessen Zustand nach Bestandszahlen gemittelt. Eine Bestellung darf die 100-Mio.-€-Reserve nicht unterschreiten.

Freie Maschinen lassen sich nach Bestätigung einzeln verkaufen. Der Wert liegt bei 100 % Zustand bei 65 % des Neupreises und sinkt mit dem Zustand. Während Wartung oder Streckenbindung ist der Verkauf gesperrt. Eine Streckenstilllegung führt Maschinen zunächst zum Ausgangshub zurück, statt sie aus einem laufenden Flug verschwinden zu lassen.

## Wirtschaft und Berichte

Neue Strecken kosten einmalig 250.000 € für Station und Vertrieb. Die Flugrechnung berücksichtigt Kerosinverbrauch, Flughafenkosten, Handling, Navigation, variable Crewkosten, Service und anteilige Personal-/Flottenfixkosten. Break-even berücksichtigt den variablen Kostenanstieg je zusätzlichem Gast. Ein Preis unter den variablen Passagierkosten kann den Break-even nicht erreichen.

Der Personalansatz beträgt 105 modellierte Stellen pro Flugzeug zu 130 € pro Tag; es handelt sich nicht um den gesamten realen Konzernpersonalbestand. Daneben fallen 3.500 € Fixkosten pro Flugzeug und Tag sowie 12.000 € Infrastrukturkosten pro Musterfamilie und Airline an. A319/A320/A321 gehören dabei zu einer Familie. Das macht ineffiziente Reserven und zu große Mustervielfalt teuer.

Der Finanzbericht ist **cash-basiert**: Kerosineinkäufe werden beim Einkauf und nicht nochmals beim Verbrauch gebucht. Die Streckenrechnung bewertet dagegen den tatsächlichen Verbrauch zum aktuellen Preis. Ein anfänglich vorhandener Tankvorrat kann den Cashflow deshalb vorübergehend günstiger aussehen lassen. Flugzeugkäufe/-verkäufe und Finanzierung sind von operativem Cashflow getrennt. Abschreibungen und eine vollständige Konzernbilanz fehlen noch.

Die Kreditlinie beträgt 250 Mio. € zu 8 % pro Spieljahr; Rückzahlungen erfordern vorhandenes Geld. Tageswerte werden für 90 Spieltage und die letzten 600 Buchungen gespeichert. Die Oberfläche zeigt sieben Tage sowie die jüngsten 60 Kontobewegungen.

## Speicherung und Grenzen

Alles wird im Browser gespeichert und kann als JSON exportiert/importiert werden. Browserdaten zu löschen entfernt den lokalen Spielstand. Sicherungen regelmäßig exportieren. Bestehende Version-2-Spielstände erhalten die neuen Betriebsfelder automatisch; Geld und Flotte bleiben bestehen. Laufende Alt-Umläufe werden beim Umstieg auf das neue Phasenmodell neu eingeordnet. Zusätzliche KI-Angebote bei erweiterten Flughafenkatalogen dürfen vorhandene Flottenbudgets nicht überschreiten.

Ein aktiver Spieltab wird empfohlen: Mehrere gleichzeitig laufende Tabs können den gemeinsamen lokalen Speicher überschreiben. Es gibt keine Synchronisierung zwischen Geräten und keine manipulationssichere Serverzeit.

Noch vereinfacht sind insbesondere Kabinenklassen, Einzel-Slots, Crew-Dienstpläne, Payload/Reichweitenkurven, vollständige Anschlussnachfrage, individuelles Aircraft-Wartungsalter und echte Wetterdaten. Keine Oberfläche behauptet Live-Daten.

## Technik und Tests

- `market.js`: deterministischer Nachfragemarkt und KI-Unternehmen.
- `data.js`: Szenariodaten, Airline-Profile und Formatierung.
- `game.js`: Spielzustand, Migration, Ereignisverarbeitung, Wirtschaft und Aktionen.
- `cockpit.js`: Oberfläche, Planungswerkzeuge und Navigation.
- `assets/`: lokale SVG-Flugzeuggrafiken und Natural-Earth-Kartengeometrie.

Simulation ohne Zusatzpakete prüfen:

```sh
node tests/market.cjs
```

Die Tests prüfen endliche Nachfrage, 124 KI-Runden, finanzierte Flottenbudgets, eindeutige Flugzeugzuordnung, Reichweitenreserve, Migration, feste Buchungen, Hin-/Rückflug und Bodenzeit, Nachtflugruhe einschließlich Sommerzeit, Flugausfälle, echte Wartungsdauer, Verkaufssperren und Verkaufserlöse, aktiven/Offline-Gleichlauf, Buchungsabgleich, Uhrzeitrückstellung und 30 simulierte Tage Betrieb.

Optionaler Browser-Integrationstest mit Playwright und Chromium:

```sh
node tests/browser.cjs
```

Der Test startet selbst einen lokalen Server auf einem freien Port. `GAME_URL` und `CHROMIUM_PATH` können überschrieben werden. Geprüft werden alle Seiten auf Desktop/Mobil, Planungsvalidierung, Streckeneröffnung/-änderung, Buchungsgebühr, Bestellungen/Auslieferung, Kredite, Fehlermeldungen, Verkäufe, geordnete Stilllegung und Automatiken.

## Recherche und Herkunft

Die Mechaniken sind eigenständig umgesetzt. Referenzen für die Gestaltung von Managementwerkzeugen waren die offiziellen Dokumentationen, nicht fremde Programmcodes oder Spielgrafiken:

- [AirlineSim: Operations und Flugzeugvergleich](https://handbook.airlinesim.aero/en/docs/user-interface/operations-tab/)
- [AirlineSim: Flugplanung, Bodenzeiten und Wartungsfenster](https://handbook.airlinesim.aero/en/docs/beginners-guide/scheduling-flights/)
- [AirwaySim: Spielkonzept, Planung und Wirtschaft](https://www.airwaysim.com/About)
- [Lufthansa Group: Airlines und Routennetz](https://business.lufthansagroup.com/gb/en/program/experts/route-network.html)
- [Fraport: Betriebszeiten](https://www.fraport.com/en/business-areas/operations/airside-and-terminal-operations/hours-of-operation.html)
- [Munich Airport: Nachtflugregelung](https://www.munich-airport.com/night-flight-264466)
- [Zürich: Nachtflugordnung und Verspätungsabbau](https://www.zh.ch/de/mobilitaet/luftverkehr/flughafenpolitik/flugbetrieb-umwelt.html)
- [Natural Earth: Public-Domain-Kartendaten](https://www.naturalearthdata.com/about/terms-of-use/), lokal abgeleitet aus `ne_110m_land.geojson`.

## Flugzeugabbildungen

Die Flottenkarten verwenden typ- und betreiberspezifische Originalabbildungen von den offiziellen Flottenseiten der Lufthansa Group und ihrer Airlines. Der Katalog in `assets/fleet-images.js` enthält geprüfte Bild- und Quellenadressen; alle 20 Airline/Muster-Kombinationen des neuen Startbestands haben eine eigene Zuordnung. Ein Quellenlink steht an jeder Abbildung. Die Abbildungen sind Eigentum der jeweiligen Rechteinhaber; es wird keine freie Bildlizenz behauptet.

Die Originalbilder werden direkt vom jeweiligen Anbieter geladen und benötigen Internetzugang. Ohne Verbindung, bei blockierten Bildadressen oder entfernten Bildern erscheint eine klar bezeichnete lokale Symbolabbildung. Bei später angeschafften Kombinationen ohne Originalbild wird eine Typreferenz eines anderen Group-Betreibers ausdrücklich als solche bezeichnet; ohne Typreferenz bleibt die Symbolabbildung erhalten. Bilder werden verzögert geladen und vollständig eingepasst, damit Flügel und Leitwerk nicht abgeschnitten werden.
