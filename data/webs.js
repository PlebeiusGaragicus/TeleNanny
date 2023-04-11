import { WebSocket } from 'ws';

// https://gis.intterragroup.com/arcgis/admin/generateToken
// use HTTP referer: of dc.intterragroup.com
// https://gis.intterragroup.com/arcgis/admin/www/doc/index.html#/API_Security/02w000000028000000/

const url = `wss://dc.intterragroup.com/nrte/?access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnQiOiJkMTNjZjE4YS0zNDc0LTQ2Y2UtOWM0My03YTk0NDI3MzkyODAiLCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwiaWF0IjoxNjgxMDk0NDMwODIxLCJleHAiOjE2ODEwOTgwMzA4MjEsInhzcmZ0b2tlbiI6Ik44c0lhbXZLIiwic3ViIjoiNjFiMTU0MWEtNTE5OS00ZmEzLWFhYmUtMmRlNTZhOTEzNGMwIiwidXNlcm5hbWUiOiJzdGE5IiwibmFtZSI6IlBGJlIgU3RhdGlvbiA5IiwiZW1haWwiOiJzdGF0aW9uOUBwb3J0bGFuZG9yZWdvbi5nb3YiLCJncm91cHV1aWQiOiIzMzZhNzQ4OS1hY2EyLTQxOWEtODkyNi03ZTRmOTNkOTg4ODUiLCJncm91cCI6IlBvcnRsYW5kIiwicm9sZXV1aWRzIjoiMTMxMmIwMWUtNDc5OC00ZjQ1LWIyMGMtOWVlMmJlYjJiOGVlLGMxNzg4MjVlLTA2YjYtNDFkYi04ZjM5LWIyMjVjYWRmNDY0MCxjNTU2YmUyZS0xZWEyLTQyNjYtYmI0OC0zN2Y3NmFhNDMxM2QiLCJyb2xlcyI6ImFuYWx5dGljc19haXJib3JuZV9yZXF1aXJlZF9kYXRhLHNpdHN0YXRfZnVsbCxPcHMiLCJyb2xlcHJpdmlsZWdlcyI6IjEsMSwxIiwicm9sZVR5cGVzIjpudWxsLCJzaWciOiJHTVZ3THlpcyJ9.Vo239jeMKEW9cyvrYKcGieMDgA_1EC1WCzq8de6l8EN_Tbq-U_apTFrIw38utYbeWdfBkI3zW2FkmKyOTlvvCRGWXFPg0JvhuW_coXalNkXbLL7Si0weK33FLAhcRWIrFAsdK5LaUFzpe4lcEIR75SzyNYIHyLyEp8FV0DvMeE4&EIO=3&transport=websocket`


const ws = new WebSocket(url);

ws.on('open', () => {
    console.log('WebSocket connection opened:', url);
});


ws.addEventListener('message', (event) => {

    // let startPos = event.data.indexOf('[{');
    // if (startPos !== -1) {
    // } else {
    // }
    let startPos = event.data.indexOf('{');


    // remove last character if it's a ']'
    // Extract the JSON object from the message
    let jsonString = event.data.slice(startPos);
    if (jsonString[jsonString.length - 1] === ']')
        jsonString = jsonString.slice(0, -1);

    const data = JSON.parse(jsonString);

    // const data = JSON.parse(event.data);
    console.log(data);
});


// ws.on('message', (message) => {
//     console.log(message)

//     const data = JSON.parse(message);
//     console.log(data);

//     // console.log(message);
// });

ws.on('close', () => {
    console.log('WebSocket connection closed:');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});