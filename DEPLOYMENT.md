# Real Estate CRM - Deployment Guide

## DigitalOcean App Platform Deployment

### Prerequisites
1. Push your code to GitHub
2. Set up A record: `realestatecrm.stackforgeit.com` → DigitalOcean's nameservers
3. Have your database connection string ready

### Deployment Steps

1. **Create a new App in DigitalOcean App Platform:**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Connect your GitHub repository
   - Select the `main` branch

2. **Configure Environment Variables:**
   Add these in the App Platform environment variables section:
   ```
   DATABASE_URL=postgresql://doadmin:AVNS_KnKkxaC9ISU7o23wDmf@db-users-do-user-17695676-0.g.db.ondigitalocean.com:25060/defaultdb?sslmode=require&schema=realestate_crm
   NEXTAUTH_SECRET=16Piw/jlgyoTHNr+ybpCpczCyejzjVtHWiS6KgxUyfk=
   NEXTAUTH_URL=https://realestatecrm.stackforgeit.com
   NODE_ENV=production
   ```

3. **App Configuration:**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - HTTP Port: 3000
   - Instance Size: Basic (512MB RAM)

4. **Custom Domain:**
   - Add domain: `realestatecrm.stackforgeit.com`
   - App Platform will provide DNS instructions
   - Wait for SSL certificate to provision (5-10 minutes)

5. **Deploy:**
   - Click "Create Resources"
   - Wait for build and deployment to complete
   - Visit https://realestatecrm.stackforgeit.com

### Post-Deployment

1. **Create First Admin User:**
   - Visit https://realestatecrm.stackforgeit.com/signup
   - Sign up with your email
   - You'll automatically be made admin (first user)

2. **Verify Database Connection:**
   - Log in and test creating properties, clients, leads
   - Check Users page to confirm admin access

### Troubleshooting

- **Build fails:** Check environment variables are set correctly
- **Database connection errors:** Verify DATABASE_URL includes `sslmode=require`
- **Auth errors:** Ensure NEXTAUTH_URL matches your domain exactly (with https://)
- **502 errors:** Check app logs in DigitalOcean dashboard

### Important Security Notes

- Change NEXTAUTH_SECRET to a unique value for production
- Keep DATABASE_URL secret - never commit to git
- Consider adding IP restrictions to your database in DigitalOcean

### Monitoring

Check your app's health in the DigitalOcean dashboard:
- View logs for errors
- Monitor resource usage
- Set up alerts for downtime
