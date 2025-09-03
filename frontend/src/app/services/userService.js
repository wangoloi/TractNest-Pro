// User management service functions

// Function to get all users
export const getAllUsers = (users) => {
  return Object.values(users);
};

// Function to update user status
export const updateUserStatus = (users, username, newStatus) => {
  if (!users[username]) {
    throw new Error("User not found");
  }

  const updatedUsers = {
    ...users,
    [username]: {
      ...users[username],
      status: newStatus
    }
  };

  return updatedUsers;
};

// Function to update user subscription
export const updateUserSubscription = (users, username, subscriptionData) => {
  if (!users[username]) {
    throw new Error("User not found");
  }

  const updatedUsers = {
    ...users,
    [username]: {
      ...users[username],
      subscription: {
        ...users[username].subscription,
        ...subscriptionData
      }
    }
  };

  return updatedUsers;
};

// Function to update user details
export const updateUserDetails = (users, username, updatedData) => {
  if (!users[username]) {
    throw new Error("User not found");
  }

  const updatedUsers = {
    ...users,
    [username]: {
      ...users[username],
      ...updatedData
    }
  };

  return updatedUsers;
};

// Function to delete user
export const deleteUser = (users, username) => {
  if (!users[username]) {
    throw new Error("User not found");
  }

  const updatedUsers = { ...users };
  delete updatedUsers[username];

  return updatedUsers;
};

// Function to add new user
export const addNewUser = (users, userData) => {
  const { username, ...otherData } = userData;
  
  if (users[username]) {
    throw new Error("Username already exists");
  }

  const newUser = {
    username,
    ...otherData,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    status: "active",
    isBlocked: false
  };

  const updatedUsers = {
    ...users,
    [username]: newUser
  };

  return updatedUsers;
};

// Function to generate username
export const generateUsername = (firstName, lastName) => {
  const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  const timestamp = Date.now().toString().slice(-4);
  return `${baseUsername}${timestamp}`;
};

// Function to generate password
export const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Function to generate business ID
export const generateBusinessId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let businessId = 'BIZ';
  for (let i = 0; i < 8; i++) {
    businessId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return businessId;
};

// Function to add new admin with business
export const addNewAdminWithBusiness = (users, adminData) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    businessName,
    businessType,
    businessAddress,
    businessPhone,
    businessEmail
  } = adminData;

  const username = generateUsername(firstName, lastName);
  const password = generatePassword();
  const businessId = generateBusinessId();

  if (users[username]) {
    throw new Error("Username already exists");
  }

  const newAdmin = {
    username,
    password,
    name: `${firstName} ${lastName}`,
    email,
    phone,
    role: "admin",
    status: "active",
    isBlocked: false,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    businessId,
    businessName,
    businessType,
    businessAddress,
    businessPhone,
    businessEmail,
    subUsers: [],
    permissions: {
      sales: true,
      inventory: true,
      customers: true,
      reports: true,
      settings: true
    },
    subscription: {
      plan: "Premium",
      status: "trial",
      amount: 0,
      nextPayment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    performance: {
      salesCount: 0,
      revenue: 0,
      customers: 0
    },
    generatedCredentials: {
      username,
      password,
      generatedBy: "System",
      generatedAt: new Date().toISOString()
    }
  };

  const updatedUsers = {
    ...users,
    [username]: newAdmin
  };

  return { updatedUsers, user: newAdmin };
};

// Function to add sub-user to business
export const addSubUserToBusiness = (users, businessId, subUserData) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    role = "user"
  } = subUserData;

  const username = generateUsername(firstName, lastName);
  const password = generatePassword();

  if (users[username]) {
    throw new Error("Username already exists");
  }

  const newSubUser = {
    username,
    password,
    name: `${firstName} ${lastName}`,
    email,
    phone,
    role,
    status: "active",
    isBlocked: false,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    businessId,
    permissions: {
      sales: role === "admin" ? true : false,
      inventory: role === "admin" ? true : false,
      customers: role === "admin" ? true : false,
      reports: role === "admin" ? true : false,
      settings: false
    },
    generatedCredentials: {
      username,
      password,
      generatedBy: "Business Owner",
      generatedAt: new Date().toISOString()
    }
  };

  const updatedUsers = {
    ...users,
    [username]: newSubUser
  };

  // Update the business owner's subUsers array
  const businessOwner = Object.values(users).find(user => user.businessId === businessId && user.role === "admin");
  if (businessOwner) {
    updatedUsers[businessOwner.username] = {
      ...updatedUsers[businessOwner.username],
      subUsers: [...businessOwner.subUsers, username]
    };
  }

  return { updatedUsers, user: newSubUser };
};

// Function to get business users
export const getBusinessUsers = (users, businessId) => {
  return Object.values(users).filter(user => user.businessId === businessId);
};

// Function to get sub users
export const getSubUsers = (users, businessId) => {
  return Object.values(users).filter(user => 
    user.businessId === businessId && user.role !== "admin"
  );
};

// Function to check business access
export const hasBusinessAccess = (user) => {
  return user && user.businessId && user.role === "admin";
};
