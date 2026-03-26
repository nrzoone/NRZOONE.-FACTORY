import fs from 'fs';
import path from 'path';

const replacements = [
    // Text sizes
    ['text-3xl md:text-6xl', 'text-2xl md:text-3xl'],
    ['text-4xl md:text-5xl', 'text-2xl md:text-3xl'],
    ['text-2xl md:text-3xl', 'text-xl md:text-2xl'],
    ['text-4xl', 'text-2xl'],
    ['text-5xl', 'text-3xl'],
    ['text-6xl', 'text-3xl'],
    
    // Borders / Rounding
    ['rounded-[3rem] md:rounded-[5rem]', 'rounded-3xl'],
    ['rounded-[3.5rem] md:rounded-[4.5rem]', 'rounded-3xl'],
    ['rounded-[3rem] md:rounded-[4rem]', 'rounded-3xl'],
    ['rounded-[2.5rem] md:rounded-[3.5rem]', 'rounded-2xl'],
    ['rounded-[2.5rem] md:rounded-[4rem]', 'rounded-3xl'],
    ['rounded-[2rem] md:rounded-[3rem]', 'rounded-xl'],
    ['rounded-[1.5rem] md:rounded-[2.5rem]', 'rounded-xl'],
    ['rounded-[1.5rem] md:rounded-[2.2rem]', 'rounded-xl'],
    ['rounded-[4rem]', 'rounded-3xl'],
    ['rounded-[3.5rem]', 'rounded-3xl'],
    ['rounded-[3rem]', 'rounded-2xl'],
    ['rounded-[2.5rem]', 'rounded-2xl'],
    ['rounded-[2rem]', 'rounded-xl'],
    ['rounded-[1.5rem]', 'rounded-lg'],
    
    // Padding
    ['p-8 md:p-12', 'p-5 md:p-6'],
    ['p-10 md:p-12', 'p-6 md:p-6'],
    ['p-8 md:p-10', 'p-5 md:p-6'],
    ['p-6 md:p-8', 'p-4 md:p-5'],
    ['p-10 md:p-16', 'p-6 md:p-8'],
    ['p-8 md:p-16', 'p-6 md:p-8'],
    
    // Custom axis paddings
    ['px-12 py-6', 'px-6 py-3'],
    ['px-10 py-5', 'px-5 py-3'],
    ['px-8 py-5', 'px-4 py-3'],
    ['px-8 py-6', 'px-4 py-3'],
    ['px-8 py-4', 'px-4 py-2'],
    ['px-8 py-3', 'px-4 py-2'],
    ['py-5 md:py-10', 'py-3 md:py-4'],
    
    // Specific icon / box sizes
    ['w-20 h-20 md:w-24 md:h-24', 'w-12 h-12 md:w-16 md:h-16'],
    ['w-16 h-16 md:w-20 md:h-20', 'w-10 h-10 md:w-12 md:h-12'],
    ['w-24 h-24', 'w-16 h-16'],
    ['w-20 h-20', 'w-12 h-12']
];

function processFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [find, replace] of replacements) {
        // Need to be careful. We can just use replaceAll or regex.
        // We can escape brackets for regex
        const escapedFind = find.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        // Let's use string splitting/joining for exact exact matching.
        // But some might have multiple spaces. Let's just use regular replaceAll if possible.
        // Node 15+ supports replaceAll.
        content = content.replaceAll(find, replace);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

const filesToProcess = [
    'src/App.jsx',
    'src/components/panels/FactoryPanel.jsx',
    'src/components/panels/ExpensePanel.jsx',
    'src/components/panels/OutsideWorkPanel.jsx',
    'src/components/panels/PataFactoryPanel.jsx',
    'src/components/panels/InventoryPanel.jsx',
    'src/components/panels/CuttingPanel.jsx',
    'src/components/panels/AttendancePanel.jsx'
];

filesToProcess.forEach(f => {
    if(fs.existsSync(f)) {
        processFile(f);
    }
});
