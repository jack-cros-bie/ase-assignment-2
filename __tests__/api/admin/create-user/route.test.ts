import { POST } from '@/app/api/admin/create-user/route';
import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/server/sql/sqlHandler.server';

jest.mock('bcrypt');
jest.mock('@/server/sql/sqlHandler.server');

describe('POST /api/admin/create-user', () => {
  let req: Partial<NextRequest>;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    req = { json: jsonMock };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns 400 if username or password is missing', async () => {
    jsonMock.mockResolvedValueOnce({ username: '', password: '' });

    const res = await POST(req as NextRequest);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Username and password are required'
    });
  });

  it('hashes password and inserts user on success', async () => {
    jsonMock.mockResolvedValueOnce({ username: 'alice', password: 'hunter2' });
    (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed-password');
    (query as jest.Mock).mockResolvedValueOnce(undefined);

    const res = await POST(req as NextRequest);

    // bcrypt.hash called correctly
    expect(bcrypt.hash).toHaveBeenCalledWith('hunter2', 10);

    // query called with correct SQL and parameters
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO Account'),
      ['alice', 'hashed-password']
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it('returns 500 if the database insert fails', async () => {
    jsonMock.mockResolvedValueOnce({ username: 'bob', password: 'secret' });
    (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed-secret');
    (query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await POST(req as NextRequest);

    expect(query).toHaveBeenCalled(); // we don’t need full SQL here again
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error creating user:',
      expect.any(Error)
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to create user' });

    consoleSpy.mockRestore();
  });
});
