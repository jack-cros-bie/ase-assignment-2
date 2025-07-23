// __tests__/api/timesheet/submit-route.test.ts

// 1) Mock external modules
jest.mock('jsonwebtoken');
jest.mock('@/server/sql/sqlHandler.server');

import { NextRequest } from 'next/server';

describe('POST /api/timesheet/submit', () => {
  const OLD_ENV = process.env;
  let POST: (req: NextRequest) => Promise<any>;
  let mockedVerify: jest.MockedFunction<typeof import('jsonwebtoken')['verify']>;
  let mockedQuery: jest.MockedFunction<typeof import('@/server/sql/sqlHandler.server')['query']>;

  beforeAll(() => {
    // nothing here; env is set per-test
  });

  afterAll(() => {
    process.env = OLD_ENV;
    jest.resetModules();
  });

  beforeEach(async () => {
    // Reset modules so JWT_SECRET is re-read and mocks are fresh
    jest.resetModules();

    // 1) Set test JWT_SECRET
    process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret' };

    // 2) Require mocks
    mockedVerify = require('jsonwebtoken').verify;
    mockedQuery = require('@/server/sql/sqlHandler.server').query;

    // 3) Import the route handler
    const route = await import('@/app/api/timesheet/submit/route');
    POST = route.POST;

    // 4) Clear mock history and set defaults
    jest.clearAllMocks();
    // By default, query resolves
    mockedQuery.mockResolvedValue(undefined);
    // By default, verify returns payload
    mockedVerify.mockImplementation((token, secret) => {
      return { userid: 99 } as any;
    });
  });

  function makeReq(options: {
    token?: string;
    entriesBody?: any;
  } = {}) {
    const { token, entriesBody } = options;
    const cookies = {
      get: jest.fn().mockReturnValue(
        token != null ? { value: token } : undefined
      )
    };
    const json = jest.fn().mockResolvedValue(
      entriesBody !== undefined ? entriesBody : { entries: [] }
    );
    return { cookies, json } as unknown as NextRequest;
  }

  it('returns 500 if JWT_SECRET is missing', async () => {
    // Remove JWT_SECRET
    delete process.env.JWT_SECRET;
    // Re-import handler without secret
    jest.resetModules();
    const route = await import('@/app/api/timesheet/submit/route');
    POST = route.POST;

    const req = makeReq({ token: 'any', entriesBody: { entries: [{ code: 'X', date: '2025-07-23', start: '09:00', end: '17:00' }] } });
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'Missing JWT_SECRET environment variable'
    });
  });

  it('returns 401 if no auth token present', async () => {
    const req = makeReq({ entriesBody: { entries: [{ code: 'X', date: '2025-07-23', start: '09:00', end: '17:00' }] } });
    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: 'Not authenticated'
    });
    expect(mockedVerify).not.toHaveBeenCalled();
  });

  it('returns 401 if token is invalid/expired', async () => {
    mockedVerify.mockImplementation(() => { throw new Error('Invalid token'); });

    const req = makeReq({ token: 'bad-token', entriesBody: { entries: [{ code: 'X', date: '2025-07-23', start: '09:00', end: '17:00' }] } });
    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: 'Invalid or expired token'
    });
  });

  it('returns 400 if entries array is missing or empty', async () => {
    // Test undefined entries
    const req1 = makeReq({ token: 'good', entriesBody: { foo: [] } });
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);
    expect(await res1.json()).toEqual({
      error: 'No entries provided'
    });

    // Test empty entries
    const req2 = makeReq({ token: 'good', entriesBody: { entries: [] } });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);
    expect(await res2.json()).toEqual({
      error: 'No entries provided'
    });
  });

  it('inserts only complete entries and returns 200 on success', async () => {
    const entries = [
      { code: 'A1', date: '2025-07-23', start: '09:00', end: '12:00' },
      { code: '',  date: '2025-07-23', start: '13:00', end: '17:00' }, // Intentionally incomplete to simulate invalid date/time
      { code: 'B2', date: '2025-07-24', start: '10:00', end: '18:00' }
    ];
    const req = makeReq({ token: 'good', entriesBody: { entries } });
    const res = await POST(req);

    // Should skip the incomplete entry (second one) and call query twice
    expect(mockedQuery).toHaveBeenCalledTimes(2);
    expect(mockedQuery).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO timesheets'),
      [99, 'A1', '2025-07-23', '09:00', '12:00']
    );
    expect(mockedQuery).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO timesheets'),
      [99, 'B2', '2025-07-24', '10:00', '18:00']
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      message: 'Timesheets submitted successfully'
    });
  });

  it('returns 500 if a database error occurs', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockedQuery.mockRejectedValueOnce(new Error('DB down'));

    const req = makeReq({
      token: 'good',
      entriesBody: { entries: [{ code: 'X', date: '2025-07-23', start: '09:00', end: '17:00' }] }
    });
    const res = await POST(req);

    expect(consoleSpy).toHaveBeenCalledWith(
      'API error:',
      expect.objectContaining({ message: 'DB down' })
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'DB down'
    });
    consoleSpy.mockRestore();
  });
});

