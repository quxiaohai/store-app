import fs from 'node:fs';
import path from 'node:path';

function parseEnvValue(value) {
    const trimmed = value.trim();
    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1);
    }
    return trimmed;
}

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    content.split(/\r?\n/).forEach((line) => {
        const text = line.trim();
        if (!text || text.startsWith('#')) {
            return;
        }

        const index = text.indexOf('=');
        if (index === -1) {
            return;
        }

        const key = text.slice(0, index).trim();
        const value = parseEnvValue(text.slice(index + 1));
        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    });
}

loadEnvFile(path.resolve(process.cwd(), '.env.local'));

export function env(name, fallback = '') {
    return process.env[name] ?? fallback;
}
