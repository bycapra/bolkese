import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(rootDir, 'data')
const schemaPath = path.join(rootDir, 'src', 'schema.sql')

fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(path.join(dataDir, 'bolkese.sqlite'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.exec(fs.readFileSync(schemaPath, 'utf8'))

export default db
