# Lufthansa Group Manager

`index.html` in einem aktuellen Browser öffnen. Das Spiel läuft lokal und speichert automatisch im Browser. In „Spielstand“ kann der Spielstand zusätzlich exportiert und wieder importiert werden. Ein alter Skyward-Spielstand wird separat aufbewahrt.

Das Spiel beginnt mit einer vereinfachten Flotte und einem modellierten Streckennetz von Lufthansa, SWISS und Austrian. Die Gruppen-Personalzahl orientiert sich am Geschäftsbericht 2025 (103.255 Mitarbeitende); sie enthält auch nicht spielbare Bereiche. Flottenzahlen, Strecken, Preise und Wettbewerber sind teilweise gerundet oder modelliert. Wettbewerber sind ein statischer Überblick ohne eigene Simulation.

Flugzeuge werden in Gruppen nach Airline und Typ verwaltet. Die angegebene Anzahl auf einer Strecke fliegt diese in einer vereinfachten Wiederholung; Positionen, Rückflüge und Flughafenslots werden nicht einzeln simuliert. Ticketumsatz und Kosten werden beim Abschluss berechnet. Kerosin muss nachgekauft werden, und der Zustand der Flottenmuster sinkt mit den Flugstunden. Wartung stellt den Zustand sofort wieder her. Bei fehlendem Kerosin oder Zustand von 20 % fallen Flüge aus. Flugzeugbestellungen werden sofort bezahlt und nach 2–3 Stunden ausgeliefert.

Beim erneuten Öffnen werden abgeschlossene Flüge, Auslieferungen und Personalkosten anhand der verstrichenen Systemzeit nachberechnet. Flüge werden dabei streckenweise abgearbeitet, nicht streng chronologisch; bei Kerosinknappheit ist die Verteilung daher vereinfacht. Zwischenzeitlich ausgefallene Flüge werden nicht nachgeholt. Änderungen der Systemzeit beeinflussen die Simulation. Browserdaten zu löschen kann den Spielstand entfernen; regelmäßiger Export schützt davor.

Die Weltkarte ist eine schematische lokale Darstellung. Für eine detaillierte Karte werden noch zusätzliche Kartendaten benötigt. Das Spiel funktioniert ohne Internet; optionale Webschriften werden nur bei Verbindung geladen.

Quellen für die Größenordnung: https://report.lufthansagroup.com/2025/annual-report/en/combined-management-report/principles-of-the-group/employees/ und https://report.lufthansagroup.com/2025/annual-report/en/combined-management-report/business-segments/passenger-airlines-business-segment/lufthansa-airlines/ sowie https://www.airfranceklm.com/en/group/fleet
# airline_sim
