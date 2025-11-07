export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface SeatRecord {
  seatNumber: string;
  position: string;
  status: string;
  section: string;
  row: string;
  available: boolean;
}

export interface PassRecord {
  passId: string;
  studentName: string;
  issueDate: string;
  expiryDate: string;
  passType: string;
  isActive: boolean;
}

export interface TripRecord {
  timestamp: string;
  tripType: string;
  seatNumber: string;
  seatPosition: string;
  passId: string;
  name: string;
  semester: string;
  program: string;
  destination: string;
  farePaid: boolean;
}

export interface TripCounts {
  morning: number;
  evening: number;
}

type GetParams = Record<string, string>;

const baseUrl = import.meta.env.VITE_SMARTPASS_API_URL;

function ensureBaseUrl(): string {
  if (!baseUrl) {
    throw new Error('SmartPass API URL is not configured. Set VITE_SMARTPASS_API_URL in your environment.');
  }
  return baseUrl;
}

function buildUrl(params: GetParams): string {
  const url = new URL(ensureBaseUrl());
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.message || 'SmartPass API error');
  }

  if (typeof json.data === 'undefined') {
    throw new Error('SmartPass API did not return data');
  }

  return json.data;
}

async function getRequest<T>(params: GetParams): Promise<T> {
  const url = buildUrl(params);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  return handleResponse<T>(response);
}

async function postRequest<T>(body: Record<string, unknown>): Promise<T> {
  const params = new URLSearchParams();

  Object.entries(body).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === 'boolean') {
      params.append(key, value ? 'TRUE' : 'FALSE');
      return;
    }

    params.append(key, String(value));
  });

  const response = await fetch(ensureBaseUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Accept': 'application/json',
    },
    body: params.toString(),
  });

  return handleResponse<T>(response);
}

export async function fetchSeat(seatNumber: string): Promise<SeatRecord> {
  return getRequest<SeatRecord>({ action: 'getSeat', seatNumber });
}

export async function fetchSeats(): Promise<SeatRecord[]> {
  return getRequest<SeatRecord[]>({ action: 'getSeats' });
}

export async function createSeat(data: SeatRecord): Promise<{ message: string }> {
  return postRequest<{ message: string }>({ action: 'addSeat', ...data });
}

export async function removeSeat(seatNumber: string): Promise<{ message: string }> {
  return postRequest<{ message: string }>({ action: 'deleteSeat', seatNumber });
}

export async function fetchPasses(): Promise<PassRecord[]> {
  return getRequest<PassRecord[]>({ action: 'getPasses' });
}

export async function createPass(data: PassRecord): Promise<{ message: string }> {
  return postRequest<{ message: string }>({ action: 'addPass', ...data });
}

export async function removePass(passId: string): Promise<{ message: string }> {
  return postRequest<{ message: string }>({ action: 'deletePass', passId });
}

export async function logTrip(data: {
  tripType: string;
  seatNumber: string;
  seatPosition: string;
  passId: string;
  fullName: string;
  semester: string;
  program: string;
  destination: string;
  farePaid: boolean;
}): Promise<{ message: string }> {
  return postRequest<{ message: string }>({ action: 'addTrip', ...data });
}

export async function fetchTripCounts(): Promise<TripCounts> {
  return getRequest<TripCounts>({ action: 'countTrips' });
}

export async function fetchTrips(): Promise<TripRecord[]> {
  return getRequest<TripRecord[]>({ action: 'getTrips' });
}

