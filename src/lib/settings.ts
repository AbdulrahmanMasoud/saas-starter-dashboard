import { db } from "@/lib/db"

/**
 * Get a single setting value by key
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await db.setting.findUnique({
      where: { key },
    })
    return setting?.value || null
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error)
    return null
  }
}

/**
 * Get multiple settings by keys
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const settings = await db.setting.findMany({
      where: {
        key: { in: keys },
      },
    })
    return Object.fromEntries(settings.map((s) => [s.key, s.value]))
  } catch (error) {
    console.error("Error fetching settings:", error)
    return {}
  }
}

/**
 * Get all settings in a group
 */
export async function getSettingsByGroup(group: string): Promise<Record<string, string>> {
  try {
    const settings = await db.setting.findMany({
      where: { group },
    })
    return Object.fromEntries(settings.map((s) => [s.key, s.value]))
  } catch (error) {
    console.error(`Error fetching settings for group ${group}:`, error)
    return {}
  }
}
