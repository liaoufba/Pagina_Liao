import fs from 'fs';
import path from 'path';
import { swaggerSpec } from '../src/config/swagger';

const outputPath = path.join(__dirname, '../openapi.json');

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`OpenAPI spec successfully generated at ${outputPath}`);
