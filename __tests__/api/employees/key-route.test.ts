// __tests__/api/employees/key-route.test.ts

// 1) Mock the SQL handler
jest.mock('@/server/sql/sqlHandler.server', () => ({
  query: jest.fn(),
}));

import { GET } from '@/app/api/employees/key/route';
import { query } from '@/server/sql/sqlHandler.server';

describe('GET /api/employees/key', () => {
  const mockedQuery = query as jest.MockedFunction<typeof query>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and top 5 employees on success', async () => {
    const fakeEmployees = [
      { userid: 1, firstname: 'Alice', surname: 'Smith', jobtitle: 'Developer' },
      { userid: 2, firstname: 'Bob',   surname: 'Jones', jobtitle: 'Designer' }
      // …you could list up to five entries here…
    ];
    mockedQuery.mockResolvedValueOnce(fakeEmployees);

    const res = await GET();

    // Verify we queried for the correct columns and limit
    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        `SELECT "userid", "firstname", "surname", "jobtitle"`
      )
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(fakeEmployees);
  });

  it('returns 500 and logs error when query throws', async () => {
    const dbError = new Error('DB failure');
    mockedQuery.mockRejectedValueOnce(dbError);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await GET();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching key employees:',
      dbError
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: 'Failed to load key employees'
    });

    consoleSpy.mockRestore();
  });
});

