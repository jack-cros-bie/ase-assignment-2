// __tests__/api/manager-approvals/SetAnnualLeaveApproval-route.test.ts

// 1) Mock the SQL handler
jest.mock('@/server/sql/sqlHandler.server', () => ({
  query: jest.fn(),
}));

import { POST } from '@/app/api/manager-approvals/ApproveAnnualLeave/route';
import { query } from '@/server/sql/sqlHandler.server';

describe('POST /api/manager-approvals/ApproveAnnualLeave', () => {
  const mockedQuery = query as jest.MockedFunction<typeof query>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to stub a Request with only a `url` property
  const makeRequest = (url: string): Request =>
    ({ url } as unknown as Request);

  it('returns 400 if leaveentryid parameter is missing', async () => {
    const req = makeRequest('');
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'leaveentryid parameter is required'
    });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('returns 400 if leaveentryid is not a number', async () => {
    const req = makeRequest('?leaveentryid=not-a-number');
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Invalid leaveentryid.  Must be a number.'
    });
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
    const error = new Error('DB failure');
    mockedQuery.mockRejectedValueOnce(error);
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const req = makeRequest('?leaveentryid=5');
    const res = await POST(req);

    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE annualleave'),
      [5]
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting leave approval:',
      error
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'Failed to approve leave'
    });

    consoleSpy.mockRestore();
  });
});

