const express = require('express');
const path = require('path');
const WebSocket = require('ws');


const app = express();
const port = 3000;


app.use(express.static(path.join(__dirname, 'public')));

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    console.log('New WebSocket client connected');

    ws.on('message', message => {
        const messageString = message.toString();
        console.log(`Received message: ${messageString}`);

        try {
            const data = JSON.parse(messageString);
            console.log('Received JSON data:', data);

            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (e) {
            // 3. เมื่อได้รับข้อความ 'PUNCH' จาก ESP8266
            if (messageString === 'PUNCH') {
                console.log('Punching button pressed on ESP8266. Notifying all web clients...');

                // 4. ส่งข้อความ 'START_MUSIC' ไปยังไคลเอนต์หน้าเว็บทั้งหมด
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send('START_MUSIC');
                    }
                });
            }

            if (messageString === 'RESET_GAME') {
                console.log('Reset button pressed on ESP8266. Notifying all web clients to stop music...');
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send('STOP_MUSIC');
                    }
                })
            }

            // change Mode
            if (messageString.startsWith('CHANGE_MODE')) {
                const newMode = messageString.split(' ')[1];
                console.log(`Changing mode to: ${newMode}`);
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(`MODE_CHANGED ${newMode}`);
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})