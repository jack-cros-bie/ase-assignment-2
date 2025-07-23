// __tests__/api/employees/information-route.test.ts

// 1) Mock the sql handler
jest.mock('@/server/sql/sqlHandler.server', () => ({
  query: jest.fn(),
}));

import { GET } from '@/app/api/employees/information/route';
import { NextRequest } from 'next/server';
import { query } from '@/server/sql/sqlHandler.server';

describe('GET /api/employees/information?userid=…', () => {
  const mockedQuery = query as jest.MockedFunction<typeof query>;
  const makeReq = (qs: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/employees/information');
    Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v));
    // Only `nextUrl.searchParams` is used by our handler
    return { nextUrl: url } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if userid is missing', async () => {
    const req = makeReq();
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Missing userid query parameter'
    });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('returns 400 if userid is invalid', async () => {
    const req = makeReq({ userid: 'abc' });
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Invalid userid query parameter'
    });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('returns 404 if no employee found', async () => {
    mockedQuery.mockResolvedValueOnce([]);
    const req = makeReq({ userid: '123' });
    const res = await GET(req);

    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('FROM "employeedetails"'),
      [123]
    );
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: 'No employee found for userid 123'
    });
  });

  it('returns 200 and the employee record on success', async () => {
    const record = {
      userid: 42,
      firstname: 'Alice',
      surname: 'Smith',
      jobtitle: 'Developer',
      companystartdate: '2022-05-01'
    };
    mockedQuery.mockResolvedValueOnce([record]);

    const req = makeReq({ userid: '42' });
    const res = await GET(req);

    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT *'),
      [42]
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(record);
  });

  it('returns 500 if the database call throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedQuery.mockRejectedValueOnce(new Error('DB failure'));

    const req = makeReq({ userid: '7' });
    const res = await GET(req);

    expect(mockedQuery).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching employee details:',
      expect.any(Error)
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'Failed to load employee details'
    });

    consoleSpy.mockRestore();
  });
});

