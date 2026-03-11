import React, { useState, useRef, useEffect } from "react";
import { 
  Copy, 
  Check, 
  FileText, 
  Settings, 
  Thermometer, 
  Printer, 
  Clock, 
  Calendar, 
  Zap, 
  ChevronRight,
  Info
} from "lucide-react";

const VARIABLES = [
  { key: "input_filename_base", label: "Dateiname (Basis)", category: "Datei", example: "benchy", icon: <FileText size={14} /> },
  { key: "plate_name", label: "Plate Name", category: "Datei", example: "Plate 1", icon: <FileText size={14} /> },
  { key: "print_preset", label: "Druckprofil", category: "Profile", example: "0.2mm QUALITY", icon: <Settings size={14} /> },
  { key: "printer_preset", label: "Drucker-Profil", category: "Profile", example: "Prusa MK4", icon: <Printer size={14} /> },
  { key: "physical_printer_preset", label: "Physischer Drucker", category: "Profile", example: "My MK4", icon: <Printer size={14} /> },
  { key: "filament_preset", label: "Filament-Profil", category: "Filament", example: "Prusament PLA", icon: <Thermometer size={14} /> },
  { key: "filament_type[0]", label: "Filamenttyp", category: "Filament", example: "PLA", icon: <Thermometer size={14} /> },
  { key: "initial_filament_type", label: "Erster Filamenttyp", category: "Filament", example: "PETG", icon: <Thermometer size={14} /> },
  { key: "printing_filament_types", label: "Alle Filamenttypen", category: "Filament", example: "PLA;PETG", icon: <Thermometer size={14} /> },
  { key: "bed_temperature[0]", label: "Betttemperatur", category: "Filament", example: "60", icon: <Thermometer size={14} /> },
  { key: "layer_height", label: "Schichthöhe", category: "Druck", example: "0.2", icon: <Zap size={14} /> },
  { key: "nozzle_diameter[0]", label: "Düsendurchmesser", category: "Druck", example: "0.4", icon: <Zap size={14} /> },
  { key: "print_time", label: "Druckzeit", category: "Druck", example: "2h30m", icon: <Clock size={14} /> },
  { key: "total_weight", label: "Gewicht (g)", category: "Druck", example: "48", icon: <Zap size={14} /> },
  { key: "total_cost", label: "Kosten", category: "Druck", example: "0.80", icon: <Zap size={14} /> },
  { key: "used_filament", label: "Filament verbraucht", category: "Druck", example: "16.4", icon: <Zap size={14} /> },
  { key: "num_objects", label: "Anzahl Objekte", category: "Druck", example: "3", icon: <Zap size={14} /> },
  { key: "scale", label: "Skalierung", category: "Druck", example: "100", icon: <Zap size={14} /> },
  { key: "curr_bed_type", label: "Druckbetttyp", category: "Druck", example: "Cool Plate", icon: <Zap size={14} /> },
  { key: "version", label: "Slicer Version", category: "Slicer", example: "2.8.0", icon: <Settings size={14} /> },
  { key: "timestamp", label: "Zeitstempel", category: "Zeit", example: "20240315_143022", icon: <Calendar size={14} /> },
  { key: "year", label: "Jahr", category: "Zeit", example: "2024", icon: <Calendar size={14} /> },
  { key: "month", label: "Monat", category: "Zeit", example: "03", icon: <Calendar size={14} /> },
  { key: "day", label: "Tag", category: "Zeit", example: "15", icon: <Calendar size={14} /> },
  { key: "hour", label: "Stunde", category: "Zeit", example: "14", icon: <Clock size={14} /> },
  { key: "minute", label: "Minute", category: "Zeit", example: "30", icon: <Clock size={14} /> },
];

const PRESETS = [
  { name: "Standard", template: "{input_filename_base}_{filament_type[0]}_{print_time}_{layer_height}mm.gcode" },
  { name: "Vollständig", template: "{year}-{month}-{day}_{if plate_name!=\"\"}{plate_name}{else}{input_filename_base}{endif}_{total_weight}g_{filament_type[0]}_{print_time}_Nozzle-{nozzle_diameter[0]}_{curr_bed_type}_{layer_height}mm_{print_preset}.gcode" },
  { name: "Mit Datum", template: "{year}{month}{day}_{input_filename_base}_{layer_height}mm_{filament_type[0]}.gcode" },
  { name: "Qualitätsfokus", template: "{input_filename_base}_{nozzle_diameter[0]}mm_Nozzle_{layer_height}mm_Layer_{filament_type[0]}.gcode" },
];

const CATEGORIES = ["Datei", "Profile", "Filament", "Druck", "Zeit", "Slicer"];
const CAT_COLORS = {
  Datei: "#f97316",
  Profile: "#8b5cf6",
  Filament: "#10b981",
  Druck: "#3b82f6",
  Zeit: "#ec4899",
  Slicer: "#6b7280",
};

function getPreview(template: string): string {
  let preview = template;
  // Handle {if ...}{...}{else}{...}{endif} - simple mock
  preview = preview.replace(/\{if\s+plate_name!=""\}(.*?)\{else\}(.*?)\{endif\}/gs, (_: string, a: string, b: string) => b);
  preview = preview.replace(/\{if\s+.*?\}(.*?)\{else\}(.*?)\{endif\}/gs, (_: string, a: string, b: string) => a); // General mock
  
  // Replace variables
  VARIABLES.forEach(v => {
    preview = preview.replace(new RegExp(`\\{${v.key.replace(/[\[\]]/g, "\\$&")}\\}`, "g"), v.example);
  });
  
  // Clean up remaining unknown tags
  preview = preview.replace(/\{[^}]*\}/g, "???");
  return preview;
}

export default function App() {
  const [template, setTemplate] = useState("{input_filename_base}_{filament_type[0]}_{print_time}_{nozzle_diameter[0]}mm_{print_preset}.gcode");
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [copied, setCopied] = useState(false);
  const [ifVar, setIfVar] = useState("plate_name");
  const [ifOp, setIfOp] = useState('!=""');
  const [ifA, setIfA] = useState("");
  const [ifB, setIfB] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAt = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = template.slice(0, start) + text + template.slice(end);
    setTemplate(newVal);
    
    // Maintain focus and position
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const insertVariable = (key: string) => insertAt(`{${key}}`);

  const insertIf = () => {
    const ifStr = `{if ${ifVar}${ifOp}}${ifA || `{${ifVar}}`}{else}${ifB || `{input_filename_base}`}{endif}`;
    insertAt(ifStr);
  };

  const copyToClipboard = () => {
    // Standard copy logic for web/canvas
    const textArea = document.createElement("textarea");
    textArea.value = template;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const previewText = getPreview(template);
  const filteredVariables = activeCategory === "Alle" 
    ? VARIABLES 
    : VARIABLES.filter(v => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">Slicer Filename Builder</h1>
            </div>
          </div>
          {/* Info-Badge wurde entfernt */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Editor & Variables */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Editor Area */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Editor</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(p => (
                  <button 
                    key={p.name}
                    onClick={() => setTemplate(p.template)}
                    className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative group">
              <textarea
                ref={textareaRef}
                value={template}
                onChange={(e) => setTemplate((e.target as HTMLTextAreaElement).value)}
                className="w-full min-h-[120px] bg-[#121216] border border-white/10 rounded-xl p-4 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all outline-none"
                placeholder="Gib dein Template hier ein..."
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">
                {template.length} Zeichen
              </div>
            </div>
          </section>

          {/* Live Preview Card */}
          <section className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText size={120} />
            </div>
            <div className="relative">
              <label className="text-xs font-bold uppercase tracking-widest text-orange-500/80 mb-4 block">Vorschau des Dateinamens</label>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-mono text-white break-all leading-tight bg-black/20 p-2 rounded">
                    {previewText}
                  </div>
                  <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 italic">
                    <Info size={12} /> Beispielwerte werden zur Visualisierung genutzt.
                  </p>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all shrink-0 ${
                    copied ? 'bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Kopiert" : "Kopieren"}
                </button>
              </div>
            </div>
          </section>

          {/* Variables Library */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Variablen Bibliothek</label>
              <div className="flex flex-wrap gap-1.5">
                {["Alle", ...CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                      activeCategory === cat 
                        ? 'bg-white text-black border-white' 
                        : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredVariables.map(v => (
                <button
                  key={v.key}
                  onClick={() => insertVariable(v.key)}
                  className="group flex flex-col items-start p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 hover:bg-white/10 transition-all text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded bg-white/5 group-hover:bg-orange-500/20 text-slate-400 group-hover:text-orange-500 transition-colors">
                      {v.icon}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{v.category}</span>
                  </div>
                  <div className="text-sm font-mono text-slate-200 mb-1 leading-none group-hover:text-orange-400 transition-colors">
                    {"{" + v.key + "}"}
                  </div>
                  <div className="text-[11px] text-slate-500 group-hover:text-slate-400 line-clamp-1">
                    {v.label}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Section: Tools & Logic */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Logic Builder */}
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold flex items-center gap-2 text-white mb-1">
              <Zap size={16} className="text-purple-500" /> Logik-Baustein
            </h3>
            <p className="text-xs text-slate-500 mb-6">Erstelle Bedingungen für flexible Namen.</p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Variable prüfen</label>
                <select 
                  value={ifVar} 
                  onChange={e => setIfVar((e.target as HTMLSelectElement).value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500/50 appearance-none"
                >
                  {VARIABLES.map(v => <option key={v.key} value={v.key}>{v.key}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Bedingung</label>
                <select 
                  value={ifOp} 
                  onChange={e => setIfOp((e.target as HTMLSelectElement).value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500/50 appearance-none"
                >
                  <option value='!=""'>Nicht leer (!="")</option>
                  <option value='==""'>Ist leer (=="")</option>
                  <option value=">0">Größer als 0 (&gt;0)</option>
                  <option value="==0">Ist gleich 0 (==0)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Falls wahr</label>
                  <input 
                    value={ifA} 
                    onChange={e => setIfA((e.target as HTMLInputElement).value)}
                    placeholder={`{${ifVar}}`}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Sonst</label>
                  <input 
                    value={ifB} 
                    onChange={e => setIfB((e.target as HTMLInputElement).value)}
                    placeholder="basis"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="p-3 bg-black/60 rounded-lg font-mono text-[10px] leading-relaxed break-all border border-white/5">
                <span className="text-purple-400">{"{if " + ifVar + ifOp + "}"}</span>
                <span className="text-green-400">{ifA || `{${ifVar}}`}</span>
                <span className="text-purple-400">{"{else}"}</span>
                <span className="text-orange-400">{ifB || "{input_filename_base}"}</span>
                <span className="text-purple-400">{"{endif}"}</span>
              </div>

              <button 
                onClick={insertIf}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-600/20"
              >
                In Template einfügen
              </button>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Trennzeichen & Endungen</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[["_", "Underscore"], ["-", "Dash"], [".", "Dot"], [" ", "Space"]].map(([sep, label]) => (
                <button 
                  key={label}
                  onClick={() => insertAt(sep)}
                  className="flex items-center justify-between px-3 py-2 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-all group"
                >
                  <span className="text-orange-500 font-mono font-bold group-hover:scale-110 transition-transform">{sep === " " ? "·" : sep}</span>
                  <span className="text-[10px] text-slate-500">{label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Format ändern</label>
              <div className="flex flex-wrap gap-2">
                {[".gcode", ".bgcode", ".3mf"].map(ext => (
                  <button 
                    key={ext}
                    onClick={() => {
                      const cleaned = template.replace(/\.(gcode|bgcode|3mf|sl1)$/, "");
                      setTemplate(cleaned + ext);
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold hover:border-orange-500/30 transition-all"
                  >
                    {ext}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Help Info */}
          <div className="p-4 rounded-2xl border border-white/5 text-[11px] text-slate-500 leading-relaxed">
            <p className="font-bold text-slate-400 mb-1 flex items-center gap-1.5">
              <ChevronRight size={14} className="text-orange-500" /> Profi-Tipp:
            </p>
            Verwende Bedingungen wie <code className="text-orange-300">{"{if plate_name!=\"\"}"}</code>, um alternative Namen für einzelne Platten oder das gesamte Projekt zu definieren. Diese Makros werden von PrusaSlicer, Bambu Studio und OrcaSlicer beim Export ausgewertet.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-slate-600 font-medium italic">
            "Happy Printing! Kompatibel mit PrusaSlicer · Bambu Studio · OrcaSlicer"
          </p>
        </div>
      </footer>
    </div>
  );
}

// import React, { useState, useRef, useEffect } from "react";
// import { 
//   Copy, 
//   Check, 
//   FileText, 
//   Settings, 
//   Thermometer, 
//   Printer, 
//   Clock, 
//   Calendar, 
//   Zap, 
//   ChevronRight,
//   Info
// } from "lucide-react";

// const VARIABLES = [
//   { key: "input_filename_base", label: "Dateiname (Basis)", category: "Datei", example: "benchy", icon: <FileText size={14} /> },
//   { key: "plate_name", label: "Plate Name", category: "Datei", example: "Plate 1", icon: <FileText size={14} /> },
//   { key: "print_preset", label: "Druckprofil", category: "Profile", example: "0.2mm QUALITY", icon: <Settings size={14} /> },
//   { key: "printer_preset", label: "Drucker-Profil", category: "Profile", example: "Prusa MK4", icon: <Printer size={14} /> },
//   { key: "physical_printer_preset", label: "Physischer Drucker", category: "Profile", example: "My MK4", icon: <Printer size={14} /> },
//   { key: "filament_preset", label: "Filament-Profil", category: "Filament", example: "Prusament PLA", icon: <Thermometer size={14} /> },
//   { key: "filament_type[0]", label: "Filamenttyp", category: "Filament", example: "PLA", icon: <Thermometer size={14} /> },
//   { key: "initial_filament_type", label: "Erster Filamenttyp", category: "Filament", example: "PETG", icon: <Thermometer size={14} /> },
//   { key: "printing_filament_types", label: "Alle Filamenttypen", category: "Filament", example: "PLA;PETG", icon: <Thermometer size={14} /> },
//   { key: "layer_height", label: "Schichthöhe", category: "Druck", example: "0.2", icon: <Zap size={14} /> },
//   { key: "nozzle_diameter[0]", label: "Düsendurchmesser", category: "Druck", example: "0.4", icon: <Zap size={14} /> },
//   { key: "print_time", label: "Druckzeit", category: "Druck", example: "2h30m", icon: <Clock size={14} /> },
//   { key: "total_weight", label: "Gewicht (g)", category: "Druck", example: "48", icon: <Zap size={14} /> },
//   { key: "total_cost", label: "Kosten", category: "Druck", example: "0.80", icon: <Zap size={14} /> },
//   { key: "used_filament", label: "Filament verbraucht", category: "Druck", example: "16.4", icon: <Zap size={14} /> },
//   { key: "num_objects", label: "Anzahl Objekte", category: "Druck", example: "3", icon: <Zap size={14} /> },
//   { key: "scale", label: "Skalierung", category: "Druck", example: "100", icon: <Zap size={14} /> },
//   { key: "version", label: "PrusaSlicer Version", category: "Slicer", example: "2.8.0", icon: <Settings size={14} /> },
//   { key: "timestamp", label: "Zeitstempel", category: "Zeit", example: "20240315_143022", icon: <Calendar size={14} /> },
//   { key: "year", label: "Jahr", category: "Zeit", example: "2024", icon: <Calendar size={14} /> },
//   { key: "month", label: "Monat", category: "Zeit", example: "03", icon: <Calendar size={14} /> },
//   { key: "day", label: "Tag", category: "Zeit", example: "15", icon: <Calendar size={14} /> },
//   { key: "hour", label: "Stunde", category: "Zeit", example: "14", icon: <Clock size={14} /> },
//   { key: "minute", label: "Minute", category: "Zeit", example: "30", icon: <Clock size={14} /> },
// ];

// const PRESETS = [
//   { name: "Minimal", template: "{input_filename_base}_{layer_height}mm.gcode" },
//   { name: "Standard", template: "{input_filename_base}_{filament_type[0]}_{print_time}_{layer_height}mm.gcode" },
//   { name: "Vollständig", template: "{input_filename_base}_{filament_type[0]}_{print_time}_{nozzle_diameter[0]}mm_{print_preset}.gcode" },
//   { name: "Prusa-Empfehlung", template: "{if plate_name!=\"\"}{plate_name}{else}{input_filename_base}{endif}_{filament_type[0]}_{print_time}_{nozzle_diameter[0]}mm_{print_preset}.gcode" },
//   { name: "Mit Datum", template: "{year}{month}{day}_{input_filename_base}_{layer_height}mm_{filament_type[0]}.gcode" },
//   { name: "Qualitätsfokus", template: "{input_filename_base}_{nozzle_diameter[0]}mm_Nozzle_{layer_height}mm_Layer_{filament_type[0]}.gcode" },
// ];

// const CATEGORIES = ["Datei", "Profile", "Filament", "Druck", "Zeit", "Slicer"];
// const CAT_COLORS = {
//   Datei: "#f97316",
//   Profile: "#8b5cf6",
//   Filament: "#10b981",
//   Druck: "#3b82f6",
//   Zeit: "#ec4899",
//   Slicer: "#6b7280",
// };

// function getPreview(template) {
//   let preview = template;
//   // Handle {if ...}{...}{else}{...}{endif} - simple mock
//   preview = preview.replace(/\{if\s+plate_name!=""\}(.*?)\{else\}(.*?)\{endif\}/gs, (_, a, b) => b);
//   preview = preview.replace(/\{if\s+.*?\}(.*?)\{else\}(.*?)\{endif\}/gs, (_, a, b) => a); // General mock
  
//   // Replace variables
//   VARIABLES.forEach(v => {
//     preview = preview.replace(new RegExp(`\\{${v.key.replace(/[\[\]]/g, "\\$&")}\\}`, "g"), v.example);
//   });
  
//   // Clean up remaining unknown tags
//   preview = preview.replace(/\{[^}]*\}/g, "???");
//   return preview;
// }

// export default function App() {
//   const [template, setTemplate] = useState("{input_filename_base}_{filament_type[0]}_{print_time}_{nozzle_diameter[0]}mm_{print_preset}.gcode");
//   const [activeCategory, setActiveCategory] = useState("Alle");
//   const [copied, setCopied] = useState(false);
//   const [ifVar, setIfVar] = useState("plate_name");
//   const [ifOp, setIfOp] = useState('!=""');
//   const [ifA, setIfA] = useState("");
//   const [ifB, setIfB] = useState("");
//   const textareaRef = useRef(null);

//   const insertAt = (text) => {
//     const el = textareaRef.current;
//     if (!el) return;
//     const start = el.selectionStart;
//     const end = el.selectionEnd;
//     const newVal = template.slice(0, start) + text + template.slice(end);
//     setTemplate(newVal);
    
//     // Maintain focus and position
//     setTimeout(() => {
//       el.focus();
//       el.setSelectionRange(start + text.length, start + text.length);
//     }, 0);
//   };

//   const insertVariable = (key) => insertAt(`{${key}}`);

//   const insertIf = () => {
//     const ifStr = `{if ${ifVar}${ifOp}}${ifA || `{${ifVar}}`}{else}${ifB || `{input_filename_base}`}{endif}`;
//     insertAt(ifStr);
//   };

//   const copyToClipboard = () => {
//     // In iframe environments, we use the fallback approach
//     const textArea = document.createElement("textarea");
//     textArea.value = template;
//     document.body.appendChild(textArea);
//     textArea.select();
//     try {
//       document.execCommand('copy');
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error('Copy failed', err);
//     }
//     document.body.removeChild(textArea);
//   };

//   const previewText = getPreview(template);
//   const filteredVariables = activeCategory === "Alle" 
//     ? VARIABLES 
//     : VARIABLES.filter(v => v.category === activeCategory);

//   return (
//     <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-orange-500/30">
//       {/* Header */}
//       <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
//         <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
//               <Settings className="text-white" size={24} />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight text-white leading-tight">Filename Builder</h1>
//               <p className="text-xs text-slate-500 font-medium">Vorlage für Output Filename Format</p>
//             </div>
//           </div>
//           {/* <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
//             <span className="flex items-center gap-1.5"><Info size={14} className="text-orange-500" /> PrusaSlicer 2.x kompatibel</span>
//           </div> */}
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
//         {/* Left Section: Editor & Variables */}
//         <div className="lg:col-span-8 space-y-8">
          
//           {/* Editor Area */}
//           <section className="space-y-4">
//             <div className="flex items-center justify-between">
//               <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Editor</label>
//               <div className="flex gap-2">
//                 {PRESETS.slice(0, 3).map(p => (
//                   <button 
//                     key={p.name}
//                     onClick={() => setTemplate(p.template)}
//                     className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
//                   >
//                     {p.name}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="relative group">
//               <textarea
//                 ref={textareaRef}
//                 value={template}
//                 onChange={(e) => setTemplate(e.target.value)}
//                 className="w-full min-h-[120px] bg-[#121216] border border-white/10 rounded-xl p-4 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all outline-none"
//                 placeholder="Gib dein Template hier ein..."
//               />
//               <div className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">
//                 {template.length} Zeichen
//               </div>
//             </div>
//           </section>

//           {/* Live Preview Card */}
//           <section className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden">
//             <div className="absolute top-0 right-0 p-8 opacity-5">
//               <FileText size={120} />
//             </div>
//             <div className="relative">
//               <label className="text-xs font-bold uppercase tracking-widest text-orange-500/80 mb-4 block">Vorschau des Dateinamens</label>
//               <div className="flex items-start justify-between gap-4">
//                 <div className="flex-1 min-w-0">
//                   <div className="text-lg font-mono text-white break-all leading-tight">
//                     {previewText}
//                   </div>
//                   <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
//                     <Info size={12} /> Basiert auf vordefinierten Beispielwerten für die Visualisierung.
//                   </p>
//                 </div>
//                 <button 
//                   onClick={copyToClipboard}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shrink-0 ${
//                     copied ? 'bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
//                   }`}
//                 >
//                   {copied ? <Check size={16} /> : <Copy size={16} />}
//                   {copied ? "Kopiert" : "Kopieren"}
//                 </button>
//               </div>
//             </div>
//           </section>

//           {/* Variables Library */}
//           <section className="space-y-6">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Variablen Bibliothek</label>
//               <div className="flex flex-wrap gap-1.5">
//                 {["Alle", ...CATEGORIES].map(cat => (
//                   <button
//                     key={cat}
//                     onClick={() => setActiveCategory(cat)}
//                     className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
//                       activeCategory === cat 
//                         ? 'bg-white text-black border-white' 
//                         : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
//                     }`}
//                   >
//                     {cat}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//               {filteredVariables.map(v => (
//                 <button
//                   key={v.key}
//                   onClick={() => insertVariable(v.key)}
//                   className="group flex flex-col items-start p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 hover:bg-white/10 transition-all text-left"
//                 >
//                   <div className="flex items-center gap-2 mb-1">
//                     <span className="p-1 rounded bg-white/5 group-hover:bg-orange-500/20 text-slate-400 group-hover:text-orange-500 transition-colors">
//                       {v.icon}
//                     </span>
//                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{v.category}</span>
//                   </div>
//                   <div className="text-sm font-mono text-slate-200 mb-1 leading-none">
//                     {"{" + v.key + "}"}
//                   </div>
//                   <div className="text-[11px] text-slate-500 group-hover:text-slate-400 line-clamp-1">
//                     {v.label}
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </section>
//         </div>

//         {/* Right Section: Tools & Logic */}
//         <div className="lg:col-span-4 space-y-6">
          
//           {/* Logic Builder */}
//           <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 shadow-xl">
//             <h3 className="text-sm font-bold flex items-center gap-2 text-white mb-1">
//               <Zap size={16} className="text-purple-500" /> Logik-Baustein
//             </h3>
//             <p className="text-xs text-slate-500 mb-6">Erstelle Bedingungen für flexible Namen.</p>

//             <div className="space-y-4">
//               <div>
//                 <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Variable prüfen</label>
//                 <select 
//                   value={ifVar} 
//                   onChange={e => setIfVar(e.target.value)}
//                   className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500/50"
//                 >
//                   {VARIABLES.map(v => <option key={v.key} value={v.key}>{v.key}</option>)}
//                 </select>
//               </div>

//               <div>
//                 <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Bedingung</label>
//                 <select 
//                   value={ifOp} 
//                   onChange={e => setIfOp(e.target.value)}
//                   className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500/50"
//                 >
//                   <option value='!=""'>Nicht leer (!="")</option>
//                   <option value='==""'>Ist leer (=="")</option>
//                   <option value=">0">Größer als 0 (&gt;0)</option>
//                   <option value="==0">Ist gleich 0 (==0)</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Falls wahr</label>
//                   <input 
//                     value={ifA} 
//                     onChange={e => setIfA(e.target.value)}
//                     placeholder={`{${ifVar}}`}
//                     className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500/50"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Sonst</label>
//                   <input 
//                     value={ifB} 
//                     onChange={e => setIfB(e.target.value)}
//                     placeholder="basis"
//                     className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500/50"
//                   />
//                 </div>
//               </div>

//               <div className="p-3 bg-black/60 rounded-lg font-mono text-[10px] leading-relaxed break-all">
//                 <span className="text-purple-400">{"{if " + ifVar + ifOp + "}"}</span>
//                 <span className="text-green-400">{ifA || `{${ifVar}}`}</span>
//                 <span className="text-purple-400">{"{else}"}</span>
//                 <span className="text-orange-400">{ifB || "{input_filename_base}"}</span>
//                 <span className="text-purple-400">{"{endif}"}</span>
//               </div>

//               <button 
//                 onClick={insertIf}
//                 className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-600/20"
//               >
//                 In Template einfügen
//               </button>
//             </div>
//           </div>

//           {/* Quick Tools */}
//           <div className="bg-[#121216] border border-white/10 rounded-2xl p-6">
//             <h3 className="text-sm font-bold text-white mb-4">Trennzeichen & Endungen</h3>
//             <div className="grid grid-cols-2 gap-2 mb-6">
//               {[["_", "Underscore"], ["-", "Dash"], [".", "Dot"], [" ", "Space"]].map(([sep, label]) => (
//                 <button 
//                   key={label}
//                   onClick={() => insertAt(sep)}
//                   className="flex items-center justify-between px-3 py-2 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-all"
//                 >
//                   <span className="text-orange-500 font-mono font-bold">{sep === " " ? "·" : sep}</span>
//                   <span className="text-[10px] text-slate-500">{label}</span>
//                 </button>
//               ))}
//             </div>

//             <div className="space-y-2">
//               <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">Format ändern</label>
//               <div className="flex flex-wrap gap-2">
//                 {[".gcode", ".bgcode", ".3mf"].map(ext => (
//                   <button 
//                     key={ext}
//                     onClick={() => {
//                       const cleaned = template.replace(/\.(gcode|bgcode|3mf|sl1)$/, "");
//                       setTemplate(cleaned + ext);
//                     }}
//                     className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold hover:border-orange-500/30 transition-all"
//                   >
//                     {ext}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Help Info */}
//           <div className="p-4 rounded-2xl border border-white/5 text-[11px] text-slate-500 leading-relaxed">
//             <p className="font-bold text-slate-400 mb-1 flex items-center gap-1.5">
//               <ChevronRight size={14} className="text-orange-500" /> Profi-Tipp:
//             </p>
//             Verwende Bedingungen wie <code className="text-orange-300">{"{if plate_name!=\"\"}"}</code>, um alternative Namen für einzelne Platten oder das gesamte Projekt zu definieren. PrusaSlicer wertet diese Makros beim Export aus.
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="border-t border-white/5 py-8 mt-12">
//         <div className="max-w-6xl mx-auto px-6 text-center">
//           <p className="text-xs text-slate-600 font-medium italic">
//             "Happy Printing! Möge dein G-Code immer perfekt benannt sein."
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }
