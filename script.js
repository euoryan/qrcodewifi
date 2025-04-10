//nsole.log("Hello World");

// Function to generate the QR code
function generateQR() {
    const ssid = document.querySelector('.ssid').value;
    const password = document.querySelector('.password').value;

    // Construct the WiFi QR code data string
    const qrData = `WIFI:S:${ssid};T:WPA;P:${password};;`;

    // Update the QR code image source
    const qrCodeImg = document.getElementById('qr-code');
    qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=164x164&data=${encodeURIComponent(qrData)}`;
}

// Add event listeners to the input fields
document.querySelector('.ssid').addEventListener('input', generateQR);
document.querySelector('.password').addEventListener('input', generateQR);

// Initialize with a default QR code (optional)
generateqr();