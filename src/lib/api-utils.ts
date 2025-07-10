// Shared API utility functions

// Types for API response
interface ApiResponse {
  rowCount: number;
  rows: Record<string, unknown>[];
}

// Function to get database schema from external API
export const getSchemaDetailsAPI = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch("http://localhost:8080/schema", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching schema from API:', error);
    throw error;
  }
};

// Function to execute SQL query via external API
export const getDBDataFromQuery = async (payload: string): Promise<ApiResponse> => {
  try {
    const response = await fetch("http://localhost:8080/run-sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: payload
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching data from API:', error);
    throw error;
  }
};
