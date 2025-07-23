// __tests__/api/manager-approvals/RejectAnnualLeave-route.test.ts

jest.mock('@/server/sql/sqlHandler.server', () => ({
  query: jest.fn(),
}));

import { POST } from '@/app/api/manager-approvals/RejectAnnualLeave/route';
import { query } from '@/server/sql/sqlHandler.server';

describe('POST /api/manager-approvals/RejectAnnualLeave', () => {
  const mockedQuery = query as jest.MockedFunction<typeof query>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper: build a Request whose .url includes the querystring
  const makeRequest = (qs: string): Request =>
    ({ url: `http://localhost/api/manager-approvals/RejectAnnualLeave${qs}` } as unknown as Request);

  it('returns 400 if leaveentryid parameter is missing', async () => {
    const req = makeRequest('');
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'leaveentryid parameter is required' });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('returns 400 if leaveentryid is not a number', async () => {
    const req = makeRequest('?leaveentryid=abc');
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid leaveentryid.  Must be a number.' });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('returns 200 and the query result on success', async () => {
    const fakeResult = { affectedRows: 1 };
    mockedQuery.mockResolvedValueOnce(fakeResult);

    const req = makeRequest('?leaveentryid=123');
    const res = await POST(req);

    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE annualleave'),
      [123]
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(fakeResult);
  });

  it('returns 500 if the database call throws', async () => {
    const dbError = new Error('DB failure');
    mockedQuery.mockRejectedValueOnce(dbError);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const req = makeRequest('?leaveentryid=5');
    const res = await POST(req);

    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE annualleave'),
      [5]
    );
    expect(consoleSpy).toHaveBeenCalledWith('Error setting leave rejection:', dbError);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to reject leave' });

    consoleSpy.mockRestore();
  });
});

