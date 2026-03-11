# Filename formate

all variables to make filename

### 📁 Output Filename Format – FDM

Diese Variablen stehen im Feld **Print Settings → Output Options → Output filename format** zur Verfügung. Syntax: `{variable}` oder `[variable]`

| Variable | Beschreibung |
|---|---|
| `{input_filename_base}` | Dateiname des STL (ohne Erweiterung) |
| `{print_time}` | Geschätzte Druckzeit |
| `{normal_print_time}` | Druckzeit (normaler Modus) |
| `{silent_print_time}` | Druckzeit (Stealth-Modus) |
| `{layer_height}` | Schichthöhe |
| `{nozzle_diameter[0]}` | Düsendurchmesser (Extruder 1) |
| `{filament_preset}` | Name des Filament-Profils |
| `{initial_filament_type}` | Filamenttyp des ersten Extruders |
| `{printing_filament_types}` | Alle verwendeten Filamenttypen |
| `{print_preset}` | Name des Druckprofils |
| `{printer_preset}` | Name des Drucker-Profils |
| `{physical_printer_preset}` | Name des physischen Druckers |
| `{total_weight}` | Gesamtgewicht des Drucks (g) |
| `{total_cost}` | Gesamtkosten |
| `{used_filament}` | Verbrauchtes Filament |
| `{extruded_volume}` | Extrudiertes Volumen |
| `{total_toolchanges}` | Anzahl der Werkzeugwechsel |
| `{total_wipe_tower_filament}` | Filamentverbrauch Wipe Tower |
| `{total_wipe_tower_cost}` | Kosten Wipe Tower |
| `{num_objects}` | Anzahl der Objekte |
| `{num_instances}` | Anzahl der Instanzen |
| `{num_extruders}` | Anzahl der Extruder |
| `{num_printing_extruders}` | Anzahl der aktiv druckenden Extruder |
| `{scale}` | Skalierung |
| `{initial_extruder}` | Erster verwendeter Extruder |
| `{initial_tool}` | Erstes verwendetes Werkzeug |
| `{version}` | PrusaSlicer-Version |
| `{timestamp}` | Zeitstempel (komplett) |
| `{year}` | Jahr |
| `{month}` | Monat |
| `{day}` | Tag |
| `{hour}` | Stunde |
| `{minute}` | Minute |
| `{second}` | Sekunde |

### 💡 Hinweise

- **Vektor-Variablen** (z. B. Extruder-spezifische Werte) brauchen einen Index: `{nozzle_diameter[0]}`, `{filament_type[0]}`
- Beliebtes Beispiel-Template:

  ```
  {input_filename_base}_{layer_height}mm_{initial_filament_type}_{print_time}.gcode
  {year}_{month}_{day}_{if plate_name!=""}{plate_name}{else}{input_filename_base}{endif}_{filament_type[0]}_{print_time}_Nozzle_Diameter-{nozzle_diameter[0]}__{total_weight}g_Layer-{layer_height}_{print_preset}.gcode
  ```
