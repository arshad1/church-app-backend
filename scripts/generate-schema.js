const fs = require('fs');
const path = require('path');

// Determine provider from env (default to postgresql)
// Valid values: 'postgresql', 'mysql'
const provider = process.env.DB_PROVIDER || 'postgresql';

console.log(`Generating Prisma schema for provider: ${provider}`);

const baseSchemaPath = path.join(__dirname, '../prisma/schema.base.prisma');
const targetSchemaPath = path.join(__dirname, '../prisma/schema.prisma');

const baseSchema = fs.readFileSync(baseSchemaPath, 'utf8');

const datasourceBlock = `
// -------------------------------------
// AUTO-GENERATED FILE. DO NOT EDIT.
// To modify, edit prisma/schema.base.prisma
// and run "npm run generate"
// -------------------------------------

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}
`;

const finalSchema = datasourceBlock + '\n' + baseSchema;

fs.writeFileSync(targetSchemaPath, finalSchema);
console.log(`✅ Generated ${targetSchemaPath}`);
