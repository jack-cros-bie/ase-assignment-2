// __tests__/api/manager-approvals/GetTimesheetRequests-route.test.ts

// 1) Mock the SQL handler
jest.mock('@/server/sql/sqlHandler.server', () => ({
  query: jest.fn(),
}));

import { GET } from '@/app/api/manager-approvals/GetTimeSheetRequests/route';
import { query } from '@/server/sql/sqlHandler.server';

describe('GET /api/manager-approvals/GetTimeSheetRequests', () => {
  const mockedQuery = query as jest.MockedFunction<typeof query>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create a Request with the given query string
  const makeRequest = (qs: string): Request =>
    ({ url: qs } as unknown as Request);

  it('returns 400 if managerId parameter is missing', async () => {
    const req = makeRequest('');
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'managerId parameter is required'
    });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('returns 400 if managerId is not a number', async () => {
    const req = makeRequest('?managerId=not-a-number');
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Invalid managerId.  Must be a number.'
    });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('returns 200 and the pending timesheet requests on success', async () => {
    const fakeRecords = [
      {
        timesheetentryid: 10,
        userid: 3,
        firstname: 'Alice',
        surname: 'Smith',
        bookingcode: 'DEV',
        date: '2025-07-21',
        starttime: '09:00:00',
        endtime: '17:00:00'
      },
      {
        timesheetentryid: 11,
        userid: 4,
        firstname: 'Bob',
        surname: 'Jones',
        bookingcode: 'MEET',
        date: '2025-07-22',
        starttime: '10:00:00',
        endtime: '11:00:00'
      }
    ];
    mockedQuery.mockResolvedValueOnce(fakeRecords);

    const req = makeRequest('?managerId=42');
    const res = await GET(req);

    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        'SELECT timesheets.timesheetentryid, timesheets.userid, employeedetails.firstname'
      ),
      [42]
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(fakeRecords);
  });

  it('returns 500 if the database call throws', async () => {
    const error = new Error('DB crashed');
    mockedQuery.mockRejectedValueOnce(error);
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const req = makeRequest('?managerId=7');
    const res = await GET(req);

    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('INNER JOIN employeedetails'),
      [7]
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching key employees:',
      error
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'Failed to load key employees'
    });

    consoleSpy.mockRestore();
  });
});

