import { adminRepository } from './repository.js';
import bcrypt from 'bcryptjs';

export const adminService = {
  async getAllAdmins() {
    try {
      const admins = await adminRepository.getAllAdmins();
      return admins;
    } catch (error) {
      console.error('Service error getting all admins:', error);
      throw new Error('Failed to fetch admins');
    }
  },

  async createAdmin(adminData) {
    try {
      // Validate required fields
      const { username, email, first_name, last_name, password } = adminData;
      
      if (!username || !email || !first_name || !last_name || !password) {
        throw new Error('All fields are required');
      }

      // Check if username or email already exists
      const existingAdmin = await adminRepository.findByUsernameOrEmail(username, email);
      if (existingAdmin) {
        throw new Error('Username or email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const newAdmin = await adminRepository.createAdmin({
        username,
        email,
        first_name,
        last_name,
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });

      // Return admin without password
      const { password: _, ...adminWithoutPassword } = newAdmin;
      return adminWithoutPassword;
    } catch (error) {
      console.error('Service error creating admin:', error);
      throw error;
    }
  },

  async deleteAdmin(adminId) {
    try {
      const admin = await adminRepository.findById(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      // Prevent deleting the last admin
      const adminCount = await adminRepository.getAdminCount();
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin user');
      }

      await adminRepository.deleteAdmin(adminId);
    } catch (error) {
      console.error('Service error deleting admin:', error);
      throw error;
    }
  },

  async getAdminActivities(adminId) {
    try {
      const admin = await adminRepository.findById(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      const activities = await adminRepository.getAdminActivities(adminId);
      return activities;
    } catch (error) {
      console.error('Service error getting admin activities:', error);
      throw new Error('Failed to fetch admin activities');
    }
  }
};
