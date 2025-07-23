// __tests__/api/auth/login-route.test.ts

// Hoist these so Jest knows to mock them before any imports
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@/server/sql/sqlHandler.server');

import { NextRequest } from 'next/server';

describe('POST /api/auth/login', () => {
  const OLD_ENV = process.env;

  let POST: (req: NextRequest) => Promise<any>;
  let mockedQuery: jest.Mock;
  let mockedBcrypt: jest.Mocked<typeof import('bcrypt')>;
  let mockedJwt: jest.Mocked<typeof import('jsonwebtoken')>;

  beforeAll(() => {
    // nothing here; we set env per-test
  });

  afterAll(() => {
    process.env = OLD_ENV;
    jest.resetModules();
  });

  beforeEach(async () => {
    // 1) Reset modules so that const JWT_SECRET picks up the new env
    jest.resetModules();

    // 2) Set up env before importing the route
    process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret' };

    // 3) Require the mocked modules
    mockedBcrypt = require('bcrypt');
    mockedJwt = require('jsonwebtoken');
    mockedQuery = require('@/server/sql/sqlHandler.server').query;

    // 4) Now import the route under test
    const route = await import('@/app/api/auth/login/route');
    POST = route.POST;

    // 5) Clear mock history & define defaults
    jest.clearAllMocks();
    mockedQuery.mockResolvedValue([]); // default: no user found
  });

  it('returns 401 when username is not found', async () => {
    const req = {
      json: async () => ({ username: 'nonexistent', password: 'irrelevant' })
    } as NextRequest;

    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: 'Invalid username or password'
    });
  });

  it('returns 401 when password does not match', async () => {
    // Arrange: one user row, but compare returns false
    mockedQuery.mockResolvedValue([{ userid: 42, password: 'hashed-pass' }]);
    mockedBcrypt.compare.mockResolvedValue(false);

    const req = {
      json: async () => ({ username: 'alice', password: 'wrongpass' })
    } as NextRequest;

    const res = await POST(req);

    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT userid, password FROM Account'),
      ['alice']
    );
    expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpass', 'hashed-pass');
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: 'Invalid username or password'
    });
  });

  it('returns 200, sets JWT cookie, and returns userid on success', async () => {
    // Arrange: one user row, compare returns true, jwt.sign returns token
    mockedQuery.mockResolvedValue([{ userid: 7, password: 'hashed-secret' }]);
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedJwt.sign.mockReturnValue('fake-jwt-token');

    const req = {
      json: async () => ({ username: 'bob', password: 'correctpass' })
    } as NextRequest;

    const res = await POST(req);

    // JWT should be signed with our test-secret
    expect(mockedJwt.sign).toHaveBeenCalledWith(
      { userid: 7 },
      'test-secret',
      { expiresIn: '1h' }
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      userid: 7
    });

    const cookie = res.cookies.get('token');
    expect(cookie).toBeDefined();
    expect(cookie!.value).toBe('fake-jwt-token');
    expect(cookie!.httpOnly).toBe(true);
    expect(cookie!.maxAge).toBe(3600);
    expect(cookie!.path).toBe('/');
    expect(cookie!.secure).toBe(false);
  });
});

