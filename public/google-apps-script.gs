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
  const action = e && e.parameter ? e.parameter.action : null;
  
  try {
    switch(action) {
      case 'getSeat':
        return getSeat(e && e.parameter ? e.parameter.seatNumber : null);
      case 'getSeats':
        return getSeats();
      case 'countTrips':
        return countTrips();
      case 'getTrips':
        return getTrips();
      case 'getPasses':
        return getPasses();
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
    const data = parseRequestBody(e);
    const action = data.action;
    
    switch(action) {
      case 'addSeat':
        return addSeat(data);
      case 'deleteSeat':
        return deleteSeat(data);
      case 'addPass':
        return addPass(data);
      case 'deletePass':
        return deletePass(data);
      case 'addTrip':
        return addTrip(data);
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function parseRequestBody(e) {
  if (!e.postData || !e.postData.contents) {
    return {};
  }

  const contentType = (e.postData.type || '').toLowerCase();
  const raw = e.postData.contents;

  if (contentType.indexOf('application/json') !== -1) {
    return JSON.parse(raw);
  }

  // default: treat as form-urlencoded
  const params = raw.split('&');
  const result = {};

  params.forEach(param => {
    if (!param) return;
    const [key, value = ''] = param.split('=');
    const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
    const decodedValue = decodeURIComponent(value.replace(/\+/g, ' '));

    if (decodedValue === 'TRUE') {
      result[decodedKey] = true;
    } else if (decodedValue === 'FALSE') {
      result[decodedKey] = false;
    } else {
      result[decodedKey] = decodedValue;
    }
  });

  return result;
}

function normalizeBoolean(value, defaultValue) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (lowered === 'true' || lowered === 'yes' || lowered === '1') return true;
    if (lowered === 'false' || lowered === 'no' || lowered === '0') return false;
  }
  return typeof defaultValue === 'boolean' ? defaultValue : false;
}

function ensureSheet(name) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  if (!sheet) {
    throw new Error(`Sheet "${name}" not found`);
  }
  return sheet;
}

/**
 * Get seat information by seat number
 */
function getSeat(seatNumber) {
  if (!seatNumber) {
    return createResponse(false, 'Seat number is required');
  }

  const sheet = ensureSheet('Seats');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == seatNumber) {
      return createResponse(true, 'Seat found', {
        seatNumber: data[i][0],
        position: data[i][1] || '',
        status: data[i][2] || '',
        section: data[i][3] || '',
        row: data[i][4] !== undefined ? String(data[i][4]) : '',
        available: normalizeBoolean(data[i][5], true),
      });
    }
  }
  
  return createResponse(false, 'Seat not found');
}

/**
 * Add or update a seat
 */
function addSeat(data) {
  const sheet = ensureSheet('Seats');
  const seatNumber = data.seatNumber;
  if (!seatNumber) {
    return createResponse(false, 'Seat number is required');
  }

  const rowValues = [
    seatNumber,
    data.position || '',
    data.status || '',
    data.section || '',
    data.row || '',
    normalizeBoolean(data.available, true),
  ];
  
  const dataRange = sheet.getDataRange().getValues();
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] == seatNumber) {
      sheet.getRange(i + 1, 1, 1, rowValues.length).setValues([rowValues]);
      return createResponse(true, 'Seat updated successfully', { seatNumber });
    }
  }
  
  sheet.appendRow(rowValues);
  return createResponse(true, 'Seat added successfully', { seatNumber });
}

/**
 * Get all seats
 */
function getSeats() {
  const sheet = ensureSheet('Seats');
  const data = sheet.getDataRange().getValues();
  const seats = [];

  for (let i = 1; i < data.length; i++) {
    seats.push({
      seatNumber: data[i][0],
      position: data[i][1] || '',
      status: data[i][2] || '',
      section: data[i][3] || '',
      row: data[i][4] !== undefined ? String(data[i][4]) : '',
      available: normalizeBoolean(data[i][5], true),
    });
  }

  return createResponse(true, 'Seats retrieved', seats);
}

/**
 * Delete a seat
 */
function deleteSeat(data) {
  const seatNumber = data.seatNumber;
  if (!seatNumber) {
    return createResponse(false, 'Seat number is required');
  }

  const sheet = ensureSheet('Seats');
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == seatNumber) {
      sheet.deleteRow(i + 1);
      return createResponse(true, 'Seat deleted successfully');
    }
  }

  return createResponse(false, 'Seat not found');
}

/**
 * Add a new pass
 */
function addPass(data) {
  const sheet = ensureSheet('Passes');
  const passId = data.passId;
  if (!passId) {
    return createResponse(false, 'Pass ID is required');
  }
  const rowValues = [
    passId,
    data.studentName || '',
    data.issueDate || '',
    data.expiryDate || '',
    data.passType || '',
    normalizeBoolean(data.isActive, true),
  ];
  
  const dataRange = sheet.getDataRange().getValues();
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] == passId) {
      sheet.getRange(i + 1, 1, 1, rowValues.length).setValues([rowValues]);
      return createResponse(true, 'Pass updated successfully', { passId });
    }
  }
  
  sheet.appendRow(rowValues);
  return createResponse(true, 'Pass added successfully', { passId });
}

/**
 * Get all passes
 */
function getPasses() {
  const sheet = ensureSheet('Passes');
  const data = sheet.getDataRange().getValues();
  const passes = [];

  for (let i = 1; i < data.length; i++) {
    const issue = data[i][2] instanceof Date
      ? Utilities.formatDate(data[i][2], Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : (data[i][2] || '');
    const expiry = data[i][3] instanceof Date
      ? Utilities.formatDate(data[i][3], Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : (data[i][3] || '');

    passes.push({
      passId: data[i][0],
      studentName: data[i][1] || '',
      issueDate: issue,
      expiryDate: expiry,
      passType: data[i][4] || '',
      isActive: normalizeBoolean(data[i][5], true),
    });
  }

  return createResponse(true, 'Passes retrieved', passes);
}

/**
 * Delete a pass
 */
function deletePass(data) {
  const passId = data.passId;
  if (!passId) {
    return createResponse(false, 'Pass ID is required');
  }

  const sheet = ensureSheet('Passes');
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == passId) {
      sheet.deleteRow(i + 1);
      return createResponse(true, 'Pass deleted successfully');
    }
  }

  return createResponse(false, 'Pass ID not found');
}

/**
 * Log a trip
 */
function addTrip(data) {
  const sheet = ensureSheet('Trips');
  
  const rowValues = [
    new Date().toISOString(),
    data.tripType || '',
    data.seatNumber || '',
    data.seatPosition || '',
    data.passId || '',
    data.fullName || '',
    data.semester || '',
    data.program || '',
    data.destination || '',
    normalizeBoolean(data.farePaid, false),
  ];
  
  sheet.appendRow(rowValues);
  
  return createResponse(true, 'Trip logged successfully', {
    timestamp: rowValues[0],
    tripType: rowValues[1],
    seatNumber: rowValues[2],
    passId: rowValues[4]
  });
}

/**
 * Count trips by type for today
 */
function countTrips() {
  const sheet = ensureSheet('Trips');
  const data = sheet.getDataRange().getValues();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let morningCount = 0;
  let eveningCount = 0;
  
  for (let i = 1; i < data.length; i++) {
    const tripDate = new Date(data[i][0]);
    tripDate.setHours(0, 0, 0, 0);
    
    if (tripDate.getTime() === today.getTime()) {
      const tripType = (data[i][1] || '').toString().toLowerCase();
      if (tripType === 'morning') {
        morningCount++;
      } else if (tripType === 'evening') {
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
  const sheet = ensureSheet('Trips');
  const data = sheet.getDataRange().getValues();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const trips = [];
  
  for (let i = 1; i < data.length; i++) {
    const tripDate = new Date(data[i][0]);
    tripDate.setHours(0, 0, 0, 0);
    
    if (tripDate.getTime() === today.getTime()) {
      const timestamp = data[i][0] instanceof Date ? data[i][0].toISOString() : data[i][0];
      trips.push({
        timestamp: timestamp,
        tripType: data[i][1] || '',
        seatNumber: data[i][2] || '',
        seatPosition: data[i][3] || '',
        passId: data[i][4] || '',
        name: data[i][5] || '',
        semester: data[i][6] || '',
        program: data[i][7] || '',
        destination: data[i][8] || '',
        farePaid: normalizeBoolean(data[i][9], false),
      });
    }
  }
  
  return createResponse(true, 'Trips retrieved', trips);
}

/**
 * Create standardized JSON response
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message
  };
  
  if (typeof data !== 'undefined' && data !== null) {
    response.data = data;
  } else if (success) {
    response.data = { message: message };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
