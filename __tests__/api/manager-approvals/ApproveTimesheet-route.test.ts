// __tests__/api/manager-approvals/ApproveTimesheet-route.test.ts

jest.mock('@/server/sql/sqlHandler.server', () => ({
  query: jest.fn(),
}));

import { POST } from '@/app/api/manager-approvals/ApproveTimesheet/route';
import { query } from '@/server/sql/sqlHandler.server';

describe('POST /api/manager-approvals/ApproveTimesheet', () => {
  const mockedQuery = query as jest.MockedFunction<typeof query>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const makeRequest = (qs: string): Request =>
    ({ url: `http://localhost/api/manager-approvals/ApproveTimesheet${qs}` } as unknown as Request);

  it('returns 400 if timesheetentryid parameter is missing', async () => {
    const req = makeRequest('');
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'timesheetentryid parameter is required'
    });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('returns 400 if timesheetentryid is not a number', async () => {
    const req = makeRequest('?leaveentryid=not-a-number');
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Invalid timesheetentryid.  Must be a number.'
    });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('returns 200 and the query result on success', async () => {
    const fakeResult = { affectedRows: 1 };
    mockedQuery.mockResolvedValueOnce(fakeResult);

    const req = makeRequest('?leaveentryid=123');
    const res = await POST(req);

    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE timesheets'),
      [123]
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(fakeResult);
  });

  it('returns 500 if the database call throws', async () => {
    const error = new Error('DB failure');
    mockedQuery.mockRejectedValueOnce(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const req = makeRequest('?leaveentryid=5');
    const res = await POST(req);

    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE timesheets'),
      [5]
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting timesheet approval:',
      error
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'Failed to approve timesheet'
    });

    consoleSpy.mockRestore();
  });
});

