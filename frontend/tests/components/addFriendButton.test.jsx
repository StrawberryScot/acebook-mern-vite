import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import AddFriendButton from "../../src/components/AddFriendButton"; // default import
import { vi } from 'vitest'; // use vi from vitest instead of jest
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import '@testing-library/jest-dom';


// Mock the `localStorage` used in the component
vi.stubGlobal('localStorage', {
  getItem: vi.fn().mockReturnValue('mocked-token'),
});

// Mock the `import.meta.env` object for the test environment
vi.stubGlobal('import.meta', {
  env: {
    VITE_BACKEND_URL: 'http://mocked-backend-url.com',  // Mock the backend URL
  }
});

// Mocking the services at the top level
vi.mock('../services/Users', () => ({
  addFriend: vi.fn().mockResolvedValue(),
  getFriends: vi.fn().mockResolvedValue([{ id: 'user1' }]),
}));

// Create a mock Redux store
const store = configureStore({
  reducer: {
    // your reducers here
  },
});

describe('AddFriendButton', () => {
  afterEach(() => {
    vi.restoreAllMocks(); // Reset all mocks after each test
  });

  it('renders the button correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <AddFriendButton friendId="friend1" currentUserId="user1" />
        </BrowserRouter>
      </Provider>
    );
    const button = screen.getByText('Add Friend');
    expect(button).toBeInTheDocument();
  });

//   it('triggers handleOnClick when clicked', async () => {
//     render(
//       <Provider store={store}>
//         <BrowserRouter>
//           <AddFriendButton friendId="friend1" currentUserId="user1" />
//         </BrowserRouter>
//       </Provider>
//     );

//     const button = screen.getByText('Add Friend');
//     fireEvent.click(button);

//     await waitFor(() => {
//       const { addFriend } = require('../../src/services/Users');
//       expect(addFriend).toHaveBeenCalledTimes(1); // Ensure the addFriend function is called once
//     });
//   });
});
