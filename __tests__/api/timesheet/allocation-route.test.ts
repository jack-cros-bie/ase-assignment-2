// __tests__/api/timesheet-allocation-route.test.ts

jest.mock('jsonwebtoken');
jest.mock('@/server/sql/sqlHandler.server', () => ({
  query: jest.fn(),
}));

import { GET } from '@/app/api/timesheet/allocation/route'; // Adjust the path
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/server/sql/sqlHandler.server';

const OLD_ENV = process.env;
const mockedQuery = query as jest.MockedFunction<typeof query>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('GET /api/...(timesheet allocation)', () => {
  const makeRequest = (options: {
    token?: string;
    weekParam?: string;
  }): NextRequest => {
    const url = new URL('http://localhost/api/timesheet/allocation');
    if (options.weekParam) url.searchParams.set('week', options.weekParam);

    return {
      cookies: {
        get: () => (options.token ? { value: options.token } : undefined)
      },
      nextUrl: url
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, JWT_SECRET: 'testsecret' };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns 500 if JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;
    const req = makeRequest({ token: 'fake' });

    const res = await GET(req);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'Missing JWT_SECRET environment variable',
    });
  });

  it('returns 401 if token is missing', async () => {
    const req = makeRequest({});
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Not authenticated' });
  });

  it('returns 401 if token is invalid or expired', async () => {
    mockedJwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = makeRequest({ token: 'invalid' });
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Invalid or expired token' });
  });

  it('returns 400 for invalid date format in week param', async () => {
    mockedJwt.verify.mockReturnValue({ userid: 5 });

    const req = makeRequest({ token: 'valid', weekParam: 'bad-date' });
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid date format' });
  });

  it('returns 200 with timesheet allocation and default week', async () => {
    mockedJwt.verify.mockReturnValue({ userid: 7 });

    mockedQuery.mockResolvedValue([
      {
        bookingcode: 'DEV',
        date: '2025-07-21',
        starttime: '09:00:00',
        endtime: '17:00:00',
        approved: true,
      },
      {
        bookingcode: 'MEET',
        date: '2025-07-22',
        starttime: '10:00:00',
        endtime: '11:00:00',
        approved: true,
      },
    ]);

    const req = makeRequest({ token: 'valid' });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totalHours).toBeCloseTo(9); // 8 + 1
    expect(body.breakdown).toEqual({
      DEV: 8,
      MEET: 1,
    });
    expect(body.entries).toHaveLength(2);
  });

  it('returns 500 if database query throws', async () => {
    mockedJwt.verify.mockReturnValue({ userid: 99 });
    mockedQuery.mockRejectedValue(new Error('DB crash'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = makeRequest({ token: 'valid' });
    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'Internal server error',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Allocation API error:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});

