import { query } from '../../infrastructure/database/mysql.js';

export async function getSetting(key, organizationId) {
  const rows = await query(`
    SELECT setting_key, setting_value, setting_type, description
    FROM app_settings 
    WHERE organization_id = ? AND setting_key = ?
  `, [organizationId, key]);
  
  return rows[0] || null;
}

export async function getAllSettings(organizationId) {
  return query(`
    SELECT setting_key, setting_value, setting_type, description
    FROM app_settings 
    WHERE organization_id = ?
    ORDER BY setting_key ASC
  `, [organizationId]);
}

export async function setSetting(key, value, organizationId, type = 'string', description = null) {
  const result = await query(`
    INSERT INTO app_settings (organization_id, setting_key, setting_value, setting_type, description)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      setting_value = VALUES(setting_value),
      setting_type = VALUES(setting_type),
      description = VALUES(description),
      updated_at = CURRENT_TIMESTAMP
  `, [organizationId, key, value, type, description]);
  
  return { key, value, type, description };
}

export async function deleteSetting(key, organizationId) {
  const result = await query(`
    DELETE FROM app_settings 
    WHERE organization_id = ? AND setting_key = ?
  `, [organizationId, key]);
  
  return result.affectedRows > 0;
}

export async function setMultipleSettings(settings, organizationId) {
  const promises = settings.map(setting => 
    setSetting(setting.key, setting.value, organizationId, setting.type, setting.description)
  );
  
  return Promise.all(promises);
}
