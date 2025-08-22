import {
  getSetting,
  getAllSettings,
  setSetting,
  deleteSetting,
  setMultipleSettings
} from './repository.js';

export async function list(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const settings = await getAllSettings(organizationId);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function get(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const setting = await getSetting(req.params.key, organizationId);
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
}

export async function create(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const { key, value, type, description } = req.body;
    const setting = await setSetting(key, value, organizationId, type, description);
    res.status(201).json(setting);
  } catch (error) {
    console.error('Error creating setting:', error);
    res.status(500).json({ error: 'Failed to create setting' });
  }
}

export async function update(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const { value, type, description } = req.body;
    const setting = await setSetting(req.params.key, value, organizationId, type, description);
    res.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
}

export async function remove(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const success = await deleteSetting(req.params.key, organizationId);
    if (!success) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
}

export async function bulkUpdate(req, res) {
  try {
    const organizationId = req.user?.organization_id || 1;
    const settings = await setMultipleSettings(req.body.settings, organizationId);
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}
