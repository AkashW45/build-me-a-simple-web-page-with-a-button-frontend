document.getElementById('downloadBtn').addEventListener('click', async function() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.classList.remove('hidden');

    try {
        const response = await fetch('/download');
        if (!response.ok) {
            throw new Error('Download failed');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'random.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to download file. Please try again.');
    } finally {
        loadingIndicator.classList.add('hidden');
    }
});
