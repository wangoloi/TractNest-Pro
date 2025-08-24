// For now, use mock data until database connection is properly set up
// import { db } from '../../infrastructure/database/connection.js';

export const adminRepository = {
  async getAllAdmins() {
    try {
      // Mock data for now
      const mockAdmins = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@tracknest.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        },
        {
          id: 2,
          username: 'bachawa',
          email: 'bachawa@tracknest.com',
          first_name: 'Bachawa',
          last_name: 'Admin',
          role: 'owner',
          status: 'active',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivity: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      
      return mockAdmins;
    } catch (error) {
      console.error('Repository error getting all admins:', error);
      throw error;
    }
  },

  async findById(adminId) {
    try {
      // Mock data for now
      const mockAdmins = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@tracknest.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          username: 'bachawa',
          email: 'bachawa@tracknest.com',
          first_name: 'Bachawa',
          last_name: 'Admin',
          role: 'owner',
          status: 'active',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      return mockAdmins.find(admin => admin.id == adminId) || null;
    } catch (error) {
      console.error('Repository error finding admin by ID:', error);
      throw error;
    }
  },

  async findByUsernameOrEmail(username, email) {
    try {
      // Mock data for now
      const mockAdmins = [
        { id: 1, username: 'admin', email: 'admin@tracknest.com' },
        { id: 2, username: 'bachawa', email: 'bachawa@tracknest.com' }
      ];
      
      return mockAdmins.find(admin => admin.username === username || admin.email === email) || null;
    } catch (error) {
      console.error('Repository error finding admin by username/email:', error);
      throw error;
    }
  },

  async createAdmin(adminData) {
    try {
      const { username, email, first_name, last_name, password, role, status } = adminData;
      
      // Mock creation - in real implementation, this would insert into database
      const newAdmin = {
        id: Date.now(), // Mock ID
        username,
        email,
        first_name,
        last_name,
        role,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newAdmin;
    } catch (error) {
      console.error('Repository error creating admin:', error);
      throw error;
    }
  },

  async deleteAdmin(adminId) {
    try {
      // Mock deletion - in real implementation, this would delete from database
      const admin = await this.findById(adminId);
      if (!admin) {
        throw new Error('Admin not found or cannot be deleted');
      }
      
      return true;
    } catch (error) {
      console.error('Repository error deleting admin:', error);
      throw error;
    }
  },

  async getAdminCount() {
    try {
      // Mock count - in real implementation, this would query database
      return 2; // Mock count of existing admins
    } catch (error) {
      console.error('Repository error getting admin count:', error);
      throw error;
    }
  },

  async getAdminActivities(adminId) {
    try {
      // For now, return mock activities since we don't have an activity log table
      // In a real implementation, you would query an activity_log table
      const mockActivities = [
        {
          id: 1,
          type: 'login',
          description: 'User logged in successfully',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'create',
          description: 'Created new inventory item',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          type: 'update',
          description: 'Updated customer information',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      
      return mockActivities;
    } catch (error) {
      console.error('Repository error getting admin activities:', error);
      throw error;
    }
  }
};
