import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Backgrounds
content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-transparent');
content = content.replace(/bg-\[#111\]/g, 'gold-panel');
content = content.replace(/bg-\[#1a1a1a\]/g, 'gold-panel');
content = content.replace(/bg-\[#050505\]/g, 'bg-white/40 rounded-xl');

// Text colors
content = content.replace(/text-white/g, 'text-black');
content = content.replace(/text-slate-400/g, 'text-black/60');
content = content.replace(/text-slate-300/g, 'text-black/80');
content = content.replace(/text-slate-500/g, 'text-black/50');
content = content.replace(/text-slate-200/g, 'text-black/90');

// Borders
content = content.replace(/border-white\/10/g, 'border-black/10');
content = content.replace(/border-white\/5/g, 'border-black/5');
content = content.replace(/border-white\/20/g, 'border-black/20');
content = content.replace(/border-white\/30/g, 'border-black/30');
content = content.replace(/border-white/g, 'border-black');

// Hovers
content = content.replace(/hover:bg-white\/5/g, 'hover:bg-black/5');
content = content.replace(/hover:text-white/g, 'hover:text-black');
content = content.replace(/hover:border-white\/30/g, 'hover:border-black/30');

// Primary buttons (were bg-white text-black)
content = content.replace(/bg-white text-black/g, 'bg-black text-white');
content = content.replace(/bg-white\/10/g, 'bg-black/10');
content = content.replace(/selection:bg-white\/20/g, 'selection:bg-black/20');

// Service cards
content = content.replace(/className={`p-6 rounded-sm border text-left transition-all duration-300 \${/g, 'className={`p-6 gold-button flex flex-col items-center justify-center text-center transition-all duration-300 ${');
content = content.replace(/selectedService === service.id\n\s*\? 'border-black bg-black\/5'\n\s*: 'border-black\/10 hover:border-black\/30 hover:bg-black\/5'/g, "selectedService === service.id ? 'ring-4 ring-black/50 scale-105' : 'hover:scale-105'");

// Inputs
content = content.replace(/bg-transparent border border-black\/10 rounded-sm px-4 py-3 text-sm text-black focus:outline-none focus:border-black\/30 transition-colors/g, 'gold-input w-full px-4 py-3 text-sm transition-colors');
content = content.replace(/bg-transparent border border-black\/10 rounded-sm px-4 py-3 text-sm text-black focus:outline-none focus:border-black\/30 transition-colors placeholder:text-black\/60/g, 'gold-input w-full px-4 py-3 text-sm transition-colors placeholder:text-black/50');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
