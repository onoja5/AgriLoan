const API_BASE_URL = 'http://localhost:5000/api'; // Update with your backend URL

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
};

export const getLoanDetails = async (loanId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization if needed:
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Network request failed');
  }
};

export const submitRepayment = async (loanId: string, amount: number, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/repayments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ amount, userId })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Network request failed');
  }
};