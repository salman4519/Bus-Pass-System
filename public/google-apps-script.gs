/**
 * College Bus Smart Pass System - Backend
 * Google Apps Script Web App for managing seats, passes, and trips
 * 
 * Setup Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Create a Google Sheet with 3 sheets: "Seats", "Passes", "Trips"
 * 3. Copy this code into Code.gs
 * 4. Replace SPREADSHEET_ID with your Google Sheet ID
 * 5. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 6. Use the deployment URL in your frontend app
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

/**
 * Handle GET requests
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'getSeat':
        return getSeat(e.parameter.seatNumber);
      case 'countTrips':
        return countTrips();
      case 'getTrips':
        return getTrips();
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'addSeat':
        return addSeat(data);
      case 'addPass':
        return addPass(data);
      case 'addTrip':
        return addTrip(data);
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

/**
 * Get seat information by seat number
 */
function getSeat(seatNumber) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Seats');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == seatNumber) {
      return createResponse(true, 'Seat found', {
        seatNumber: data[i][0],
        position: data[i][1]
      });
    }
  }
  
  return createResponse(false, 'Seat not found');
}

/**
 * Add or update a seat
 */
function addSeat(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Seats');
  const seatNumber = data.seatNumber;
  const position = data.position;
  
  // Check if seat already exists
  const dataRange = sheet.getDataRange().getValues();
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] == seatNumber) {
      // Update existing seat
      sheet.getRange(i + 1, 2).setValue(position);
      return createResponse(true, 'Seat updated successfully');
    }
  }
  
  // Add new seat
  sheet.appendRow([seatNumber, position]);
  return createResponse(true, 'Seat added successfully');
}

/**
 * Add a new pass
 */
function addPass(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Passes');
  const passId = data.passId;
  const studentName = data.studentName;
  
  // Check if pass already exists
  const dataRange = sheet.getDataRange().getValues();
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] == passId) {
      return createResponse(false, 'Pass ID already exists');
    }
  }
  
  sheet.appendRow([passId, studentName]);
  return createResponse(true, 'Pass added successfully');
}

/**
 * Log a trip
 */
function addTrip(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Trips');
  
  const timestamp = new Date().toISOString();
  const tripType = data.tripType;
  const seatNumber = data.seatNumber;
  const seatPosition = data.seatPosition;
  const passId = data.passId;
  const fullName = data.fullName;
  const semester = data.semester;
  const program = data.program;
  
  sheet.appendRow([
    timestamp,
    tripType,
    seatNumber,
    seatPosition,
    passId,
    fullName,
    semester,
    program
  ]);
  
  return createResponse(true, 'Trip logged successfully');
}

/**
 * Count trips by type for today
 */
function countTrips() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Trips');
  const data = sheet.getDataRange().getValues();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let morningCount = 0;
  let eveningCount = 0;
  
  for (let i = 1; i < data.length; i++) {
    const tripDate = new Date(data[i][0]);
    tripDate.setHours(0, 0, 0, 0);
    
    if (tripDate.getTime() === today.getTime()) {
      if (data[i][1] === 'morning') {
        morningCount++;
      } else if (data[i][1] === 'evening') {
        eveningCount++;
      }
    }
  }
  
  return createResponse(true, 'Trip counts retrieved', {
    morning: morningCount,
    evening: eveningCount
  });
}

/**
 * Get all trips for today
 */
function getTrips() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Trips');
  const data = sheet.getDataRange().getValues();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const trips = [];
  
  for (let i = 1; i < data.length; i++) {
    const tripDate = new Date(data[i][0]);
    tripDate.setHours(0, 0, 0, 0);
    
    if (tripDate.getTime() === today.getTime()) {
      trips.push({
        timestamp: data[i][0],
        tripType: data[i][1],
        seatNumber: data[i][2],
        seatPosition: data[i][3],
        passId: data[i][4],
        name: data[i][5],
        semester: data[i][6],
        program: data[i][7]
      });
    }
  }
  
  return createResponse(true, 'Trips retrieved', trips);
}

/**
 * Create standardized JSON response
 */
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
