# 🌐 WebNest

A modern, full-stack bookmark and link management application built with Next.js, Convex, and Tailwind CSS. Organize, categorize, and analyze your web discoveries with beautiful analytics and a sleek interface.

![WebNest Preview](https://via.placeholder.com/800x400/1E1E1F/FFFFFF?text=WebNest+Preview)

## ✨ Features

### 🔐 Authentication & Security
- Secure user authentication with email/password
- Session management with automatic token refresh
- Protected routes and API endpoints
- Input validation and sanitization

### 📊 Analytics Dashboard
- Comprehensive usage statistics
- Most clicked websites tracking
- Highest rated bookmarks analytics
- Usage trends over time
- Folder and category insights

### 📚 Library Management
- Organize bookmarks by categories and folders
- Hierarchical folder structure
- Advanced search functionality
- Bulk operations and management

### 🎨 Modern UI/UX
- Dark/Light/System theme support
- Responsive design for all devices
- Smooth animations and transitions
- Accessible components with proper ARIA labels

### 🔍 Advanced Features
- Website rating system (1-5 stars)
- Click tracking and analytics
- Tag-based organization
- Favicon fetching and display
- Export/import capabilities

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon library

### Backend & Database
- **Convex** - Serverless backend with real-time database
- **Type-Safe API** - End-to-end type safety

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - Fast bundler (Next.js 16)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Convex account (for backend)

### 1. Clone the Repository
```bash
git clone https://github.com/WrackerTony/webnest.git
cd webnest
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Convex Backend
```bash
# Initialize Convex in your project
npx convex dev

# This will create your development deployment
# Follow the prompts to set up your Convex project
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Convex deployment URL (from step 3)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```



Open [http://localhost:3000](http://localhost:3000) to see WebNest in action!

## 📖 Usage

### Getting Started
1. **Register** a new account or **Sign In** with existing credentials
2. **Create Categories** to organize your bookmarks
3. **Add Websites** with titles, descriptions, and tags
4. **Explore Analytics** to understand your browsing patterns

### Key Workflows

#### Adding a Website
1. Navigate to the Library page
2. Click "Add Website"
3. Fill in URL, title, description, and select a category
4. Rate the website (optional)
5. Save to your collection

#### Organizing Content
- Create nested folders for hierarchical organization
- Use categories for broad grouping (Tech, Design, News, etc.)
- Add tags for flexible searching
- Rate websites to track quality

#### Analytics Insights
- View most-clicked websites
- Track usage trends over time
- Monitor category performance
- Identify popular content

## 🔒 Security Measures

This document outlines the security measures implemented in WebNest.

## Protection Against SQL Injection

✅ **Not Applicable**: This application uses Convex, a NoSQL database that:
- Uses a type-safe API instead of raw SQL queries
- Validates all inputs against defined schemas
- Eliminates SQL injection attack vectors entirely

## Protection Against XSS (Cross-Site Scripting)

### Client-Side Protection
✅ **React's Built-in XSS Protection**:
- React automatically escapes all content rendered in JSX
- All user inputs are rendered as text, not HTML
- Event handlers are bound safely

### Server-Side Protection
✅ **Input Sanitization** (`convex/auth.ts`):
- Removes control characters from all inputs
- Trims whitespace from user data
- Enforces maximum length limits on all fields

## Input Validation

### Server-Side Validation (Convex Backend)
- ✅ **Name**: 1-100 characters, sanitized
- ✅ **Email**: Valid email format (RFC 5321), max 254 characters
- ✅ **Password**: Minimum 6 characters, max 128 characters
- ✅ **Website URLs**: Valid URL format validation
- ✅ All required fields validated before processing

### Client-Side Validation (React Frontend)
- ✅ **Email**: `type="email"` with pattern validation
- ✅ **URLs**: `type="url"` validation
- ✅ **Required Fields**: HTML5 `required` attributes
- ✅ **Length Limits**: `maxLength` attributes on all inputs
- ✅ **Real-time Validation**: Instant feedback on form inputs

## Authentication Security

### Password Security
✅ **Secure Hashing**: Custom secure hash function with salt
✅ **Password Requirements**: Minimum length and complexity rules
✅ **No Plaintext Storage**: Passwords never stored in readable form

### Session Management
✅ **Secure Tokens**: Cryptographically secure session tokens
✅ **Expiration**: Automatic session cleanup (30 days)
✅ **Token Validation**: Server-side token verification

## Data Sanitization

All user inputs are sanitized through multiple layers:

1. **HTML Form Validation**: Browser-level validation
2. **Client-Side Validation**: JavaScript validation before API call
3. **Server-Side Sanitization**: Remove dangerous characters
4. **Type Validation**: Convex runtime type checking
5. **URL Sanitization**: Safe URL handling for external links

## Additional Security Best Practices

### External Links
✅ All external links use:
- `target="_blank"` - Opens in new tab
- `rel="noopener noreferrer"` - Prevents reverse tabnabbing attacks

### Content Security
✅ No dynamic HTML rendering (`dangerouslySetInnerHTML` not used)
✅ No user-generated content displayed without sanitization
✅ All images use relative paths or trusted sources
✅ Favicon fetching with error handling

### API Security
✅ **Type-Safe APIs**: Convex provides end-to-end type safety
✅ **Input Validation**: All API inputs validated against schemas
✅ **Error Handling**: Secure error responses (no sensitive data leakage)

## Rate Limiting

⚠️ **Recommendation**: Consider implementing rate limiting at the Convex level or using a service like Cloudflare to prevent abuse. Convex automatically provides some protection against abuse, but additional measures may be beneficial for production.

### Suggested Implementation:
```typescript
// In convex/auth.ts - Example rate limiting logic
// Track login attempts by IP or email in a separate table
// Limit to X attempts per hour per user
```

## Environment Variables

✅ Sensitive configuration stored in `.env.local`:
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- Never committed to version control

## Recommendations for Production

1. **Enable HTTPS**: Always use HTTPS in production
2. **Set up CORS properly**: Configure Convex CORS settings for your domain
3. **Monitor logs**: Review Convex logs for suspicious activity
4. **Add CAPTCHA**: Consider adding Google reCAPTCHA for bot protection
5. **Implement rate limiting**: Add stricter rate limits in production
6. **Regular updates**: Keep all dependencies updated
7. **Backup strategy**: Regular Convex database backups

## Security Checklist

- [x] SQL Injection protection (N/A - using Convex)
- [x] XSS protection (React + sanitization)
- [x] Input validation (client + server)
- [x] Input sanitization (server-side)
- [x] Authentication security (hashing + sessions)
- [x] Length limits enforced
- [x] Email validation
- [x] URL validation
- [x] External link security
- [x] No dangerous HTML rendering
- [ ] Rate limiting (recommended for production)
- [ ] CAPTCHA (recommended for production)
- [x] Environment variables secured

## Reporting Security Issues

If you discover a security vulnerability, please report it to the repository owner directly rather than opening a public issue.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `NEXT_PUBLIC_CONVEX_URL`
3. Deploy automatically on push

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Convex Deployment
```bash
# Deploy Convex backend
npx convex deploy
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework that makes everything possible
- **Convex** - Amazing serverless backend platform
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon library
- **Vercel** - Excellent deployment platform

## 📞 Support

If you have questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with ❤️ using Next.js, Convex, and modern web technologies**

**Last Updated**: November 28, 2025
