import fetch from "node-fetch";

const cookies = {
    access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnQiOiJkMTNjZjE4YS0zNDc0LTQ2Y2UtOWM0My03YTk0NDI3MzkyODAiLCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwiaWF0IjoxNjgxMTcwOTk0Mjg5LCJleHAiOjE2ODExNzQ1OTQyODksInhzcmZ0b2tlbiI6IjhIS2VlWUtOIiwic3ViIjoiNjFiMTU0MWEtNTE5OS00ZmEzLWFhYmUtMmRlNTZhOTEzNGMwIiwidXNlcm5hbWUiOiJzdGE5IiwibmFtZSI6IlBGJlIgU3RhdGlvbiA5IiwiZW1haWwiOiJzdGF0aW9uOUBwb3J0bGFuZG9yZWdvbi5nb3YiLCJncm91cHV1aWQiOiIzMzZhNzQ4OS1hY2EyLTQxOWEtODkyNi03ZTRmOTNkOTg4ODUiLCJncm91cCI6IlBvcnRsYW5kIiwicm9sZXV1aWRzIjoiMTMxMmIwMWUtNDc5OC00ZjQ1LWIyMGMtOWVlMmJlYjJiOGVlLGMxNzg4MjVlLTA2YjYtNDFkYi04ZjM5LWIyMjVjYWRmNDY0MCxjNTU2YmUyZS0xZWEyLTQyNjYtYmI0OC0zN2Y3NmFhNDMxM2QiLCJyb2xlcyI6ImFuYWx5dGljc19haXJib3JuZV9yZXF1aXJlZF9kYXRhLHNpdHN0YXRfZnVsbCxPcHMiLCJyb2xlcHJpdmlsZWdlcyI6IjEsMSwxIiwicm9sZVR5cGVzIjpudWxsLCJzaWciOiJHTVZ3THlpcyJ9.faq1q5Deev4rztpVT7TrdJy9L9MTPlaD_tOBRJYDomXImB6iQeMsPCu5m4pqm3kqHOjLDGShbXfGRuA_qPsVrmnIGANNvE7YrbNDZbuhUA7KCBYVbM_oHOFJUquH5YVAqNpy22cDl0SLvdRS9CY1jnwc4t2ifRocn5Tq1-FV5bw",
    refresh_token: "d1XXSY4JFwxtAZin",
    agstoken: "Vze_5xA-tuzM7_N0GmBQ8gO1xrgu4Fz6SHv6AquIBbc.",
}


const res = await fetch("https://dc.intterragroup.com/v1/sitstat/data/incidents", {
    "headers": {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "Bearer " + cookies.access_token,
        "sec-ch-ua": "\"Not:A-Brand\";v=\"99\", \"Chromium\";v=\"112\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "cookie": "access_token=" + cookies.access_token + "; refresh_token=" + cookies.refresh_token + "; agstoken=" + cookies.agstoken,
        "Referer": "https://apps.intterragroup.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "POST"
});


const data = await res.json();

console.log("Intterra: NEW INCIDENT LIST!!!!");
console.log(data);