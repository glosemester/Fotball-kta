import os
import re

# Directories to search
dirs_to_search = ['app', 'components']

# Replacement rules
replacements = {
    # Colors
    '#0A0A0A': '#000000',
    '#141414': '#1C1C1E',
    '#1C1C1C': '#2C2C2E',
    '#262626': '#38383A', # iOS border color
    '#A3A3A3': '#8E8E93', # iOS secondary gray
    '#E63946': '#0A84FF', # iOS Blue
    '#CC2F3B': '#007AFF', # iOS Blue active
    
    # Fonts
    'font-extrabold': 'font-bold',
    'font-bold': 'font-semibold',
    
    # Rounding (making it softer/squircles)
    'rounded-2xl': 'rounded-3xl',
    'rounded-xl': 'rounded-2xl',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # Remove barlowCondensed from layout.tsx
    if filepath.endswith('layout.tsx'):
        content = re.sub(r'const barlowCondensed[^;]+;', '', content)
        content = re.sub(r'import \{ Barlow_Condensed[^}]+\} from "next/font/google";\n?', '', content)
        content = content.replace('${barlowCondensed.variable} ', '')
        
    if filepath.endswith('globals.css'):
        content = content.replace('--color-background: #000000;', '--color-background: #000000;\n  --color-surface-ios: rgba(28, 28, 30, 0.7);')
        content = content.replace('background: radial-gradient(circle at top right, #1A1A1A 0%, #000000 40%, #050505 100%);', 'background: #000000;')
        # Update focus ring
        content = content.replace('rgba(230, 57, 70, 0.15)', 'rgba(10, 132, 255, 0.25)')
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root_dir in dirs_to_search:
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(('.tsx', '.ts', '.css', '.js', '.jsx')):
                process_file(os.path.join(dirpath, filename))

print("iOS Theme Applied.")
