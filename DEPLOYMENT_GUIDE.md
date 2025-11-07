# College Bus Smart Pass System - Deployment Guide

## Overview
This guide will help you deploy the complete College Bus Smart Pass System with Google Apps Script as the backend.

## Prerequisites
- Google Account
- Modern web browser
- Basic understanding of Google Sheets and Apps Script

---

## Part 1: Setting Up Google Sheets Database

### Step 1: Create a New Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **"College Bus Smart Pass Database"**

### Step 2: Create Three Sheets
Create 3 separate sheets (tabs) with the following names and headers:

#### Sheet 1: "Seats"
| Column A | Column B |
|----------|----------|
| seatNumber | position |

#### Sheet 2: "Passes"
| Column A | Column B |
|----------|----------|
| passId | studentName |

#### Sheet 3: "Trips"
| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H |
|----------|----------|----------|----------|----------|----------|----------|----------|
| timestamp | tripType | seatNumber | seatPosition | passId | fullName | semester | program |

### Step 3: Note Your Spreadsheet ID
- Look at the URL of your Google Sheet
- The ID is the long string between `/d/` and `/edit`
- Example: `https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit`
- Copy the ID (1ABC...XYZ) - you'll need it later

---

## Part 2: Deploying Google Apps Script Backend

### Step 1: Open Apps Script Editor
1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code in the editor

### Step 2: Add the Backend Code
1. Copy all the code from `public/google-apps-script.gs`
2. Paste it into the Apps Script editor
3. Find the line: `const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';`
4. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID

### Step 3: Deploy as Web App
1. Click **Deploy > New deployment**
2. Click the gear icon ⚙️ and select **Web app**
3. Fill in the settings:
   - **Description**: College Bus Smart Pass API
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Review permissions and click **Authorize access**
6. Copy the **Web app URL** - you'll need this for your frontend

---

## Part 3: Connecting Frontend to Backend

### Method 1: Update Environment Variable (Recommended for Production)

Create a file named `.env.local` in the root of your project:

```env
VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Replace `YOUR_DEPLOYMENT_ID` with your actual deployment ID from the Web app URL.

### Method 2: Direct URL Update (Quick Testing)

Update the API calls in your components to use your Apps Script URL:

```typescript
const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

---

## Part 4: Testing the System

### Test Backend APIs

Use these test URLs in your browser (replace with your actual URL):

#### Get Seat Info:
```
YOUR_WEB_APP_URL?action=getSeat&seatNumber=1
```

#### Count Trips:
```
YOUR_WEB_APP_URL?action=countTrips
```

#### Get Trips:
```
YOUR_WEB_APP_URL?action=getTrips
```

### Test Frontend Integration

1. Open the web app
2. Go to **Student Portal**
3. Click **Start Scanning**
4. Scan a generated QR code
5. Fill in trip details and submit
6. Check your Google Sheet to verify the data was saved
7. Go to **Admin Portal > Trips** to see the logged trip

---

## Part 5: Deploying Frontend

### Option 1: Deploy via Lovable (Easiest)
1. Click **Publish** button in Lovable
2. Follow the deployment steps
3. Your app will be live at `yourdomain.lovable.app`

### Option 2: Deploy to Vercel
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variable: `VITE_API_URL`
4. Deploy

### Option 3: Deploy to Netlify
1. Push code to GitHub
2. Connect to Netlify
3. Add environment variable: `VITE_API_URL`
4. Deploy

---

## Part 6: Generating QR Codes

### Using the Built-in Generator
1. Go to **Admin Portal**
2. Click **QR Gen** tab
3. Enter seat range (e.g., Start: 1, End: 40)
4. Click **Generate QR Codes**
5. Download individual codes or click **Download All**

### Printing QR Codes
1. Download QR code images
2. Print on sticker paper or laminated cards
3. Affix to corresponding seats in the bus
4. Ensure codes are clearly visible and not damaged

---

## API Endpoints Reference

### GET Endpoints

#### Get Seat Information
```
GET ?action=getSeat&seatNumber=15
Response: { success: true, data: { seatNumber: "15", position: "Window Left" } }
```

#### Count Trips
```
GET ?action=countTrips
Response: { success: true, data: { morning: 25, evening: 20 } }
```

#### Get Today's Trips
```
GET ?action=getTrips
Response: { success: true, data: [...trips] }
```

### POST Endpoints

#### Add Seat
```json
POST
{
  "action": "addSeat",
  "seatNumber": "15",
  "position": "Window Left"
}
```

#### Add Pass
```json
POST
{
  "action": "addPass",
  "passId": "PASS001",
  "studentName": "John Doe"
}
```

#### Log Trip
```json
POST
{
  "action": "addTrip",
  "tripType": "morning",
  "seatNumber": "15",
  "seatPosition": "Window Left",
  "passId": "PASS001",
  "fullName": "John Doe",
  "semester": "4",
  "program": "Computer Science"
}
```

---

## Troubleshooting

### Backend Issues

**Problem**: "Script function not found"
- **Solution**: Make sure you deployed the Apps Script as a Web App, not as an API Executable

**Problem**: "Permission denied"
- **Solution**: Redeploy and ensure "Who has access" is set to "Anyone"

**Problem**: "Spreadsheet not found"
- **Solution**: Double-check your Spreadsheet ID in the script

### Frontend Issues

**Problem**: CORS errors
- **Solution**: Google Apps Script should handle CORS automatically. Ensure you're using the correct Web App URL

**Problem**: Data not saving
- **Solution**: Check browser console for errors. Verify API URL is correct

**Problem**: Camera not working
- **Solution**: Ensure HTTPS is enabled (required for camera access). Check browser camera permissions

---

## Security Best Practices

1. **Spreadsheet Permissions**: Only share the spreadsheet with authorized personnel
2. **Apps Script Access**: Keep your deployment URL secure
3. **Data Validation**: The backend includes basic validation, but always verify data
4. **Regular Backups**: Periodically export your Sheets data
5. **Monitor Usage**: Check Apps Script quotas in Google Cloud Console

---

## Maintenance

### Daily Tasks
- Monitor trip logs
- Check for any failed submissions
- Verify QR codes are readable

### Weekly Tasks
- Export trip data for records
- Review and clean test data
- Update pass information as needed

### Monthly Tasks
- Full data backup
- Review system performance
- Update seat arrangements if changed

---

## Support

For technical issues or questions:
1. Check the troubleshooting section
2. Review Google Apps Script execution logs
3. Test API endpoints directly in browser
4. Check browser console for frontend errors

---

## System Limits

- **Google Apps Script**: 20,000 URL fetch calls per day
- **Google Sheets**: 5 million cells per spreadsheet
- **QR Codes**: Generate up to 50 at a time (can be increased)

---

## Next Steps

After successful deployment:
1. ✅ Train staff and students on system usage
2. ✅ Generate and install QR codes on all seats
3. ✅ Register all student passes
4. ✅ Conduct a test run before official launch
5. ✅ Set up daily backup routine
6. ✅ Create user documentation

---

**Congratulations!** Your College Bus Smart Pass System is now fully deployed and ready to use.
