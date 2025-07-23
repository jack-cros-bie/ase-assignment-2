// __tests__/api/timesheet/recent-route.test.ts

// 1) Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('@/server/sql/sqlHandler.server');

import { NextRequest } from 'next/server';

describe('GET /api/timesheet/recent', () => {
  const OLD_ENV = process.env;

  // Utility to load the route after setting JWT_SECRET
  async function loadRoute(secret?: string) {
    jest.resetModules();
    // Reset env
    process.env = { ...OLD_ENV };
    if (secret !== undefined) {
      process.env.JWT_SECRET = secret;
    } else {
      delete process.env.JWT_SECRET;
    }
    // Re-require mocks
    const jwt = require('jsonwebtoken');
    const { query } = require('@/server/sql/sqlHandler.server');
    // Import the route
    const route = await import('@/app/api/timesheet/recent/route');
    return { GET: route.GET, jwt, query };
  }

  afterAll(() => {
    process.env = OLD_ENV;
    jest.resetModules();
  });

  it('returns 500 if JWT_SECRET is missing', async () => {
    const { GET } = await loadRoute(undefined);

    const req = { cookies: { get: jest.fn() } } as unknown as NextRequest;
    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'Missing JWT_SECRET environment variable'
    });
  });

  it('returns 401 if no token cookie is present', async () => {
    const { GET } = await loadRoute('topsecret');

    const req = { cookies: { get: () => undefined } } as unknown as NextRequest;
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: 'Not authenticated'
    });
  });

  it('returns 401 if token is invalid or expired', async () => {
    const { GET, jwt } = await loadRoute('topsecret');
    // Make jwt.verify throw
    jwt.verify.mockImplementation(() => { throw new Error('bad token'); });

    const req = {
      cookies: { get: () => ({ value: 'bad-token' }) }
    } as unknown as NextRequest;

    const res = await GET(req);

    expect(jwt.verify).toHaveBeenCalledWith('bad-token', 'topsecret');
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: 'Invalid or expired token'
    });
  });

  it('returns 200 and recentCodes on success', async () => {
    const { GET, jwt, query } = await loadRoute('supersecret');
    // Valid verify returns payload
    jwt.verify.mockReturnValue({ userid: 5 });

    // Mock DB result
    query.mockResolvedValue([
      { bookingcode: 'A1' },
      { bookingcode: 'B2' },
      { bookingcode: 'C3' }
    ]);

    const req = {
      cookies: { get: () => ({ value: 'good-token' }) }
    } as unknown as NextRequest;

    const res = await GET(req);

    expect(jwt.verify).toHaveBeenCalledWith('good-token', 'supersecret');
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('FROM timesheets'),
      [5]
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      recentCodes: ['A1', 'B2', 'C3']
    });
  });

  it('returns 500 if query throws an error', async () => {
    const { GET, jwt, query } = await loadRoute('anothersecret');
    jwt.verify.mockReturnValue({ userid: 99 });

    const error = new Error('DB crashed');
    query.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const req = {
      cookies: { get: () => ({ value: 'token-99' }) }
    } as unknown as NextRequest;

    const res = await GET(req);

    expect(query).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to fetch recent bookingcodes:',
      error
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'DB crashed'
    });

    consoleSpy.mockRestore();
  });
});

