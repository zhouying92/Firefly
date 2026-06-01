import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function loadOverride(importMetaUrl: string, jsonFileName: string): Record<string, unknown> {
  try {
    const __dirname = dirname(fileURLToPath(importMetaUrl));
    const jsonPath = join(__dirname, jsonFileName);
    if (existsSync(jsonPath)) {
      return JSON.parse(readFileSync(jsonPath, 'utf-8'));
    }
  } catch {
    // 文件不存在或解析失败
  }
  return {};
}
