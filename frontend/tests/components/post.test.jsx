import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
//fakes localstorage because we are a test suite not a browser
import { configureStore } from '@reduxjs/toolkit';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import Post from '../../src/components/Post';
//this one allows us to use certain things in the test like expect.tohave that otherwise wouldn't work, I think because the frontend is using vite??
import '@testing-library/jest-dom';

// Mocks certain dependencies, like sub components, because otherwise we'd have double import and dependencies, and I couldn't get those to work but I know this does.
vi.mock('./LikeButton', () => ({
  default: ({ post, onLikeUpdated }) => (
    <button onClick={() => onLikeUpdated && onLikeUpdated(post)}>
      Like ({post.likes ? post.likes.length : 0})
    </button>
  )
}));
vi.mock('./EditPostForm', () => ({
  default: ({ post, onPostUpdated }) => (
    <button onClick={() => onPostUpdated && onPostUpdated({...post, text: 'Updated text'})}>
      Edit Post
    </button>
  )
}));
vi.mock('./DeletePostForm', () => ({
  default: ({ post, onPostDeleted }) => (
    <button onClick={() => onPostDeleted && onPostDeleted(post._id)}>
      Delete Post
    </button>
  )
}));

// The component uses navigate, but I just want to mock that instead of sending the test to another page which might cause a crash
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mocking storage of user state
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      user: (state = initialState.user, action) => state
    },
    preloadedState: initialState
  });
};

const mockUser = {
  _id: 'user123',
  firstName: 'Test',
  lastName: 'User',
  profilePicPath: '/test-profile.png',
};

const mockPost = {
  _id: 'post123',
  text: 'This is a test post',
  postedBy: 'user123',
  createdAt: '2025-04-10T12:00:00.000Z',
  likes: ['user456'],
  comments: [
    {
      _id: 'comment1',
      commentedBy: 'user456',
      text: 'This is a comment',
      createdAt: '2025-04-10T12:30:00.000Z',
      replies: [
        {
          _id: 'reply1',
          repliedBy: 'user789',
          text: 'This is a reply',
          createdAt: '2025-04-10T13:00:00.000Z',
        }
      ]
    }
  ]
};

describe('Post Component', () => {
  let store;
  
  //testing everything worked in the component properly
  const setupSuccessfulFetch = () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/completeProfile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            firstName: 'Test',
            lastName: 'User',
            profilePicPath: '/test-profile.png',
            status: 'online'
          }),
        });
      }
      if (url.includes('/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            name: 'Test User',
            profilePic: '/test-profile.png',
          }),
        });
      }
      if (url.includes('/name')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            name: 'Test User',
          }),
        });
      }
      if (url.includes('/comment')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            _id: 'newcomment123',
            text: 'New comment',
          }),
        });
      }
      if (url.includes('/replies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            _id: 'newreply123',
            text: 'New reply',
          }),
        });
      }
      if (url.includes('/posts/post123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPost),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  };

  // Testing it didn't
  const setupFailedFetch = () => {
    global.fetch = vi.fn(() => {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      });
    });
  };
  
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => 'fake-token'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    });
    
    // Create a fresh store before each test
    store = createMockStore({
      user: { user: mockUser }
    });
    
    // Set up successful fetch by default
    setupSuccessfulFetch();
  });
  
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('renders post with author information', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Wait for the component to load user deets
    await waitFor(() => {
      expect(screen.getByText(/Test User says:/i)).toBeInTheDocument();
    });
    
    // Check that the content is displayed
    expect(screen.getByText('This is a test post')).toBeInTheDocument();
    
    // Check for the status indicator
    const statusIndicator = document.querySelector('.status-indicator');
    expect(statusIndicator).toHaveClass('status-online');
  });

  test('hides edit and delete buttons when user is not the author', async () => {
    // Create a store with a different user
    const differentUserStore = createMockStore({
      user: { 
        user: { 
          _id: 'differentUser123', 
          firstName: 'Different', 
          lastName: 'User' 
        } 
      }
    });
    
    render(
      <Provider store={differentUserStore}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/Test User says:/i)).toBeInTheDocument();
    });
    
    // Edit and delete buttons should not be visible
    expect(screen.queryByText('Edit Post')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Post')).not.toBeInTheDocument();
  });

  test('toggles comments visibility when comments button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Initially comments should be hidden
    expect(screen.getByText(/Show Comments/)).toBeInTheDocument();
    
    // Click to show comments
    fireEvent.click(screen.getByText(/Show Comments/));
    
    // Comments should now be visible
    expect(screen.getByText(/Hide Comments/)).toBeInTheDocument();
    
    // We should see the comment text
    await waitFor(() => {
      expect(screen.getByText('This is a comment')).toBeInTheDocument();
    });
    
    // Click to hide comments
    fireEvent.click(screen.getByText(/Hide Comments/));
    
    // Comments toggle should change back
    expect(screen.getByText(/Show Comments/)).toBeInTheDocument();
  });

  test('shows the comment form when comments are visible and user is logged in', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Click to show comments
    fireEvent.click(screen.getByText(/Show Comments/));
    
    // Comment form should be visible
    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    expect(screen.getByText('Post Comment')).toBeInTheDocument();
  });

  test('submits a new comment successfully', async () => {
    const mockOnPostUpdated = vi.fn();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={mockOnPostUpdated} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Click to show comments
    fireEvent.click(screen.getByText(/Show Comments/));
    
    // Fill in the comment form
    const commentInput = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(commentInput, { target: { value: 'New comment' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Post Comment'));
    
    // Verify the fetch was called correctly
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/posts/${mockPost._id}/comment`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token'
          }),
          body: JSON.stringify({ text: 'New comment' })
        })
      );
    });
    
    // Verify that onPostUpdated was called
    expect(mockOnPostUpdated).toHaveBeenCalled();
  });

  test('shows replies when toggle is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Click to show comments
    fireEvent.click(screen.getByText(/Show Comments/));
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is a comment')).toBeInTheDocument();
    });
    
    // Click to show replies
    fireEvent.click(screen.getByText(/Show Replies/));
    
    // Wait for replies to be visible
    await waitFor(() => {
      expect(screen.getByText('This is a reply')).toBeInTheDocument();
    });
  });

  test('shows reply form when reply button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Click to show comments
    fireEvent.click(screen.getByText(/Show Comments/));
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is a comment')).toBeInTheDocument();
    });
    
    // Click reply button on the comment
    const replyButtons = screen.getAllByText('Reply');
    fireEvent.click(replyButtons[0]);
    
    // Reply form should be visible
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
    expect(screen.getByText('Post Reply')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('submits a reply successfully', async () => {
    const mockOnPostUpdated = vi.fn();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={mockOnPostUpdated} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Click to show comments
    fireEvent.click(screen.getByText(/Show Comments/));
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is a comment')).toBeInTheDocument();
    });
    
    // Click reply button on the comment
    const replyButtons = screen.getAllByText('Reply');
    fireEvent.click(replyButtons[0]);
    
    // Fill in the reply form
    const replyInput = screen.getByPlaceholderText('Write a reply...');
    fireEvent.change(replyInput, { target: { value: 'New reply' } });
    
    // Submit the reply
    fireEvent.click(screen.getByText('Post Reply'));
    
    // Verify the fetch was called correctly
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/posts/${mockPost._id}/comments/comment1/replies`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token'
          }),
          body: expect.stringContaining('New reply')
        })
      );
    });
    
    // Verify that onPostUpdated was called
    expect(mockOnPostUpdated).toHaveBeenCalled();
  });

  test('handles canceling a reply', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Click to show comments
    fireEvent.click(screen.getByText(/Show Comments/));
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is a comment')).toBeInTheDocument();
    });
    
    // Click reply button on the comment
    const replyButtons = screen.getAllByText('Reply');
    fireEvent.click(replyButtons[0]);
    
    // Reply form should be visible
    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Reply form should be gone
    expect(screen.queryByPlaceholderText('Write a reply...')).not.toBeInTheDocument();
  });

  test('handles replying to a reply', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Click to show comments
    fireEvent.click(screen.getByText(/Show Comments/));
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is a comment')).toBeInTheDocument();
    });
    
    // Click to show replies
    fireEvent.click(screen.getByText(/Show Replies/));
    
    // Wait for replies to be visible
    await waitFor(() => {
      expect(screen.getByText('This is a reply')).toBeInTheDocument();
    });
    
    // Get all reply buttons and click on the reply to a reply
    const replyButtons = screen.getAllByText('Reply');
    // The second reply button should be for the reply
    fireEvent.click(replyButtons[1]);
    
    // The reply form should include the username
    const replyInput = screen.getByPlaceholderText('Write a reply...');
    expect(replyInput.value).toContain('@');
  });

  test('handles API errors when fetching user info', async () => {
    // Set up fetch to fail
    setupFailedFetch();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // It should fall back to "Unknown User"
    await waitFor(() => {
      expect(screen.getByText(/Unknown User says:/i)).toBeInTheDocument();
    });
  });

  test('handles API errors when posting a comment', async () => {
    // Make fetch fail for comment posting
    global.fetch = vi.fn((url) => {
      if (url.includes('/comment')) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
    
    // Spy on console.error and alert
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('alert', vi.fn());
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Click to show comments
    fireEvent.click(screen.getByText(/Show Comments/));
    
    // Fill in the comment form
    const commentInput = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(commentInput, { target: { value: 'New comment' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Post Comment'));
    
    // Verify error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error posting comment'), expect.anything());
      expect(window.alert).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles API errors when posting a reply', async () => {
    // Initially setup normal fetch for comments to load
    setupSuccessfulFetch();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // click to show comments
    fireEvent.click(screen.getByText(/Show Comments/));
    
    await waitFor(() => {
      expect(screen.getByText('This is a comment')).toBeInTheDocument();
    });
    
    // fetch fails here on purpose !!!!!
    global.fetch = vi.fn((url) => {
      if (url.includes('/replies')) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
    
    // Spy on console.error and alert
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('alert', vi.fn());
    
    // Click reply button on the comment
    const replyButtons = screen.getAllByText('Reply');
    fireEvent.click(replyButtons[0]);
    
    // Fill in the reply form
    const replyInput = screen.getByPlaceholderText('Write a reply...');
    fireEvent.change(replyInput, { target: { value: 'New reply' } });
    
    // Submit a reply
    fireEvent.click(screen.getByText('Post Reply'));
    
    // Verify error handlig
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error posting reply'), expect.anything());
      expect(window.alert).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles no comments scenario correctly', async () => {
    // create a post with no comments
    const postWithNoComments = {
      ...mockPost,
      comments: []
    };
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={postWithNoComments} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // click to show comments
    fireEvent.click(screen.getByText(/Show Comments \(0\)/));
    
    // Should swe "no comments" message
    expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
  });

  //double checked, the image doesn't have to function, it uses a url and we just need the test to verify we use that url, could maybe have a test/function elsewhere to double check image urls are verified as working??? 
  test('handles post with image correctly', async () => {
    // Create a post with an image
    const postWithImage = {
      ...mockPost,
      img: 'http://example.com/image.jpg'
    };
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={postWithImage} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Look for the image
    const image = screen.getByAltText('Post image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'http://example.com/image.jpg');
  });
  
  test('handles different status indicators correctly', async () => {
    // Mock fetch to return 'busy' status
    global.fetch = vi.fn((url) => {
      if (url.includes('/completeProfile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            firstName: 'Test',
            lastName: 'User',
            profilePicPath: '/test-profile.png',
            status: 'busy'
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Post 
            post={mockPost} 
            onPostDeleted={() => {}} 
            onPostUpdated={() => {}} 
            onLikeUpdated={() => {}}
          />
        </BrowserRouter>
      </Provider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Test User says:/i)).toBeInTheDocument();
    });
    
    // Check the status indicator
    const statusIndicator = document.querySelector('.status-indicator');
    expect(statusIndicator).toHaveClass('status-busy');
  });
  
  //there are like a few other tests I can think of but this file is too long and i'm running out of time!!!
});