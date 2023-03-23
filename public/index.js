// This is the client side javascript that is loaded on the settings page

// We define this function to call later
async function fetchSettings() {
    const response = await fetch('/settings');
    const settings = await response.json();

    document.getElementById('botToken').value = settings.BOT_TOKEN || '';
    document.getElementById('chatId').value = settings.CHAT_ID || '';
    document.getElementById('braiinsToken').value = settings.BRAIINS_TOKEN || '';
}

// This grabs the submit button and adds funcionality
document.getElementById('settingsForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const botToken = document.getElementById('botToken').value;
    const chatId = document.getElementById('chatId').value;
    const braiinsToken = document.getElementById('braiinsToken').value;

    const response = await fetch('/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId, braiinsToken }),
    });

    if (response.ok) {
        alert('Settings saved successfully!  You need to restart this application for the changes to take effect.');
    } else {
        alert('Failed to save settings.');
    }
});

// This loads the .env file and populates the form
fetchSettings();
