const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.dyzo.ai';

export interface SubSection {
  id: string;
  label: string;
}

export interface Method {
  id: string;
  method: string;
  url: string;
  title: string;
  description: string;
  requestPayload?: string;
  responsePayload?: string;
}

export interface Endpoint {
  id: string;
  label: string;
  icon: string;
  hasSubSections: boolean;
  subSections?: SubSection[];
  methods?: Method[];
  overview?: {
    title: string;
    description: string;
    capabilities?: string[];
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  endpoints: Endpoint[];
}

export interface Documentation {
  version: string;
  lastUpdated: string;
  baseUrl: string;
  description: string;
  categories: Category[];
  errorCodes: Record<string, string>;
  responseHeaders: Record<string, string>;
}

class ApiDocumentationService {
  async getDocumentation(): Promise<Documentation> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documentation/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 1) {
        return data.documentation;
      } else {
        throw new Error('Failed to fetch documentation');
      }
    } catch (error) {
      console.error('Error fetching API documentation:', error);
      return this.getMockDocumentation();
    }
  }

  getMockDocumentation(): Documentation {
    return {
      version: '2.0.0',
      lastUpdated: '2024-10-29',
      baseUrl: 'https://api.dyzo.ai',
      description: 'Complete Dyzo API Documentation - Project Management, Team Collaboration & Time Tracking Platform',
      categories: [
        {
          id: 'core',
          name: 'Core APIs',
          description: 'Essential APIs for authentication and getting started',
          icon: 'heroicons:star',
          endpoints: [
            {
              id: 'getting-started',
              label: 'Getting Started',
              icon: 'heroicons:rocket-launch',
              hasSubSections: false,
              overview: {
                title: 'Getting Started with Dyzo API',
                description: 'Welcome to the Dyzo API documentation. This comprehensive guide will help you integrate our powerful project management, team collaboration, and time tracking APIs.',
                capabilities: [
                  'Authenticate using API keys or JWT tokens',
                  'Manage projects, tasks, and team members',
                  'Track time, attendance, and leaves',
                  'Generate reports and analytics',
                  'Real-time notifications and updates'
                ]
              }
            },
            {
              id: 'authentication',
              label: 'Authentication',
              icon: 'heroicons:shield-check',
              hasSubSections: true,
              subSections: [
                { id: 'api-key-auth', label: 'API Key Authentication' },
                { id: 'jwt-auth', label: 'JWT Token Authentication' },
                { id: 'otp-login', label: 'OTP Login' }
              ],
              overview: {
                title: 'Authentication API',
                description: 'Comprehensive authentication system supporting API Keys, JWT tokens, OTP, and social login.',
                capabilities: [
                  'Generate and manage API keys',
                  'JWT token authentication with auto-refresh',
                  'OTP-based login',
                  'Google OAuth and Apple Sign-In',
                  'Rate limiting and token expiration'
                ]
              }
            }
          ]
        }
      ],
      errorCodes: {
        NO_ACCESS_TOKEN: 'Missing Authorization header',
        TOKEN_EXPIRED_NO_REFRESH: 'Access token expired, no refresh token',
        INVALID_API_KEY: 'API key not found or inactive',
        RATE_LIMIT_EXCEEDED: 'Too many requests (HTTP 429)',
        USER_INACTIVE: 'User account is inactive',
        USER_NOT_FOUND: 'User not found',
        AUTHENTICATION_REQUIRED: 'Authentication required',
        INVALID_ACCESS_TOKEN: 'Invalid access token',
        API_KEY_EXPIRED: 'API key has expired'
      },
      responseHeaders: {
        'X-New-Access-Token': 'New access token after auto-refresh',
        'X-RateLimit-Remaining': 'Remaining API calls for current period',
        'X-Total-Count': 'Total records count in paginated responses',
        'X-Request-Id': 'Unique request identifier for debugging'
      }
    };
  }

  transformDocumentation(documentation: Documentation): Documentation {
    return {
      ...documentation,
      categories: documentation.categories.map(category => ({
        ...category,
        endpoints: category.endpoints.map(endpoint => ({
          ...endpoint,
          subSections: endpoint.subSections || [],
          methods: endpoint.methods || []
        }))
      }))
    };
  }
}

export default new ApiDocumentationService();
