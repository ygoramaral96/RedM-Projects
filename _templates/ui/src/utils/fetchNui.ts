/**
 * Simple wrapper around fetch API tailored for CEF/NUI use.
 * @param eventName The endpoint eventname to target
 * @param data Data to send to the C# backend
 * @param mockData Optional mock data for development (when not in game)
 */
export async function fetchNui<T = any>(
  eventName: string,
  data: any = {},
  mockData?: T
): Promise<T | null> {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(data),
  };

  // Check if we're in the game environment
  if (!(window as any).GetParentResourceName) {
    // Development mode - return mock data or null
    if (mockData) {
      return mockData;
    }
    console.log(`[DEV] fetchNui called: ${eventName}`, data);
    return null;
  }

  const resourceName = (window as any).GetParentResourceName();
  const resp = await fetch(`https://${resourceName}/${eventName}`, options);

  if (resp.ok) {
    return await resp.json();
  }

  return null;
}

