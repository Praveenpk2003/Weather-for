// Mock authentication service for development/testing
// This simulates API calls without requiring a real backend

// Mock users database
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  }
];

// Mock JWT token generation (proper JWT format)
const generateMockToken = (user) => {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  
  const payload = { 
    sub: user.id,
    email: user.email, 
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  
  const signature = "mock_signature_for_development";
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  const token = `${encodedHeader}.${encodedPayload}.${signature}`;
  
  console.log('Generating JWT token with payload:', payload);
  console.log('Generated JWT token:', token);
  
  return token;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  async login(email, password) {
    await delay(1000);
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const { password: _ignored, ...userWithoutPassword } = user;
    const token = generateMockToken(userWithoutPassword);
    
    return { user: userWithoutPassword, token };
  },

  async register(name, email, password) {
    await delay(1000);
    
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      name,
      email,
    };
    
    mockUsers.push({ ...newUser, password });
    const token = generateMockToken(newUser);
    
    return { user: newUser, token };
  },

  async verifyToken(token) {
    await delay(500);
    
    try {
      const parts = token.split('.');
      
      let decoded;
      
      if (parts.length === 3) {
        decoded = JSON.parse(atob(parts[1]));
        console.log('Decoded JWT payload:', decoded);
        
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
          throw new Error('Token expired');
        }
        
        const user = {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name
        };
        
        console.log('User from JWT token:', user);
        return user;
        
      } else if (parts.length === 1) {
        decoded = JSON.parse(atob(token));
        console.log('Decoded old format token:', decoded);
        
        if (decoded.exp < Date.now()) {
          throw new Error('Token expired');
        }
        
        const user = {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name
        };
        
        console.log('User from old format token:', user);
        return user;
        
      } else {
        throw new Error('Invalid token format');
      }
      
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Invalid token');
    }
  },

  async forgotPassword(email) {
    await delay(1000);
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return;
    }
    
    console.log(`Password reset email sent to ${email}`);
  },

  async resetPassword(token, password) {
    await delay(1000);
    
    try {
      const decoded = JSON.parse(atob(token));
      const user = mockUsers.find(u => u.id === decoded.userId);
      if (!user) {
        throw new Error('Invalid token');
      }
      
      user.password = password;
      console.log(`Password reset for user ${user.email}`);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },

  async getCurrentUser() {
    await delay(500);
    
    const user = mockUsers[0];
    const { password: _ignored, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};
