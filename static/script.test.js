let downloadBtn;
let loadingIndicator;
let fetchMock;
let createObjectURLMock;
let revokeObjectURLMock;
let alertMock;
let consoleErrorMock;

describe('Download button behavior', () => {
  beforeEach(() => {
    jest.resetModules();

    // Mock document.getElementById
    loadingIndicator = {
      classList: {
        remove: jest.fn(),
        add: jest.fn(),
      },
    };
    downloadBtn = {
      addEventListener: jest.fn((event, handler) => {
        downloadBtn.clickHandler = handler;
      }),
    };
    document.getElementById = jest.fn((id) => {
      if (id === 'loadingIndicator') return loadingIndicator;
      if (id === 'downloadBtn') return downloadBtn;
      return null;
    });

    // Mock document.createElement and body
    const anchorMock = {
      href: '',
      download: '',
      click: jest.fn(),
      remove: jest.fn(),
    };
    document.createElement = jest.fn().mockReturnValue(anchorMock);
    document.body = {
      appendChild: jest.fn(),
    };

    // Mock fetch
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    // Mock URL methods
    createObjectURLMock = jest.fn(() => 'blob:mock-url');
    revokeObjectURLMock = jest.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    // Mock alert and console.error
    alertMock = jest.fn();
    global.alert = alertMock;
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Load the script (side-effect: attaches event listener)
    require('./script');
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  test('happy path: fetches blob and triggers download', async () => {
    // Arrange
    const fakeBlob = { type: 'text/plain' };
    fetchMock.mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(fakeBlob),
    });

    // Act: simulate click
    await downloadBtn.clickHandler();

    // Assert: loading shown
    expect(loadingIndicator.classList.remove).toHaveBeenCalledWith('hidden');
    // fetch called
    expect(fetchMock).toHaveBeenCalledWith('/download');
    // blob URL created
    expect(createObjectURLMock).toHaveBeenCalledWith(fakeBlob);
    // anchor created
    expect(document.createElement).toHaveBeenCalledWith('a');
    const a = document.createElement.mock.results[0].value;
    expect(a.href).toBe('blob:mock-url');
    expect(a.download).toBe('random.txt');
    expect(document.body.appendChild).toHaveBeenCalledWith(a);
    expect(a.click).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    expect(a.remove).toHaveBeenCalled();
    // loading hidden finally
    expect(loadingIndicator.classList.add).toHaveBeenCalledWith('hidden');
  });

  test('error path: response not ok shows alert', async () => {
    // Arrange
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
    });

    // Act
    await downloadBtn.clickHandler();

    // Assert
    expect(loadingIndicator.classList.remove).toHaveBeenCalledWith('hidden');
    expect(fetchMock).toHaveBeenCalledWith('/download');
    // No blob URL creation or anchor
    expect(createObjectURLMock).not.toHaveBeenCalled();
    // Console error logged
    expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    // Alert shown
    expect(alertMock).toHaveBeenCalledWith('Failed to download file. Please try again.');
    // Loading hidden in finally
    expect(loadingIndicator.classList.add).toHaveBeenCalledWith('hidden');
  });

  test('error path: network failure shows alert', async () => {
    // Arrange
    const networkError = new Error('Network Error');
    fetchMock.mockRejectedValue(networkError);

    // Act
    await downloadBtn.clickHandler();

    // Assert
    expect(loadingIndicator.classList.remove).toHaveBeenCalledWith('hidden');
    expect(fetchMock).toHaveBeenCalledWith('/download');
    expect(console.error).toHaveBeenCalledWith('Error:', networkError);
    expect(alertMock).toHaveBeenCalledWith('Failed to download file. Please try again.');
    expect(loadingIndicator.classList.add).toHaveBeenCalledWith('hidden');
  });

  test('edge case: loading indicator toggled in correct order', async () => {
    // Verify that remove('hidden') is called before the fetch,
    // and add('hidden') is called after fetch completes (in finally)
    const fakeBlob = { type: 'text/plain' };
    fetchMock.mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(fakeBlob),
    });

    await downloadBtn.clickHandler();

    const removeCallOrder = loadingIndicator.classList.remove.mock.invocationCallOrder[0];
    const addCallOrder = loadingIndicator.classList.add.mock.invocationCallOrder[0];
    const fetchCallOrder = fetchMock.mock.invocationCallOrder[0];
    // remove should be called before fetch
    expect(removeCallOrder).toBeLessThan(fetchCallOrder);
    // add should be called after fetch
    expect(addCallOrder).toBeGreaterThan(fetchCallOrder);
  });
});