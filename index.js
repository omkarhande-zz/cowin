const fetch = require('node-fetch');
const jsonDiff = require('json-diff')
const notifier = require('node-notifier');

let resMaster = {};
let counter = 1;
let fetchInProgress = false;

async function startProgram(){
    while(true){
        counter++;
        if(counter % 5000 == 0 && !fetchInProgress){
            fetchInProgress = true;
            let centers = await fetchCenters();
            let diff = jsonDiff.diff(centers, resMaster);

            if(diff){
                console.log('\u0007');
                console.log('Detected change');
                console.log(diff);
                notifier.notify(JSON.stringify(diff));

            }
            resMaster = centers;
        }

        if(counter > 1000000){
            counter = 0;
        }
    }
}


async function fetchCenters(){
    return new Promise((resolve, reject) => {
        return fetch("https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=294&date=03-05-2021", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9,hi;q=0.8",
                "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiI1OGUzNzc2MC00MDEyLTRlYzctYTI5NC1mMjI4NTc0NDM5MWIiLCJ1c2VyX2lkIjoiNThlMzc3NjAtNDAxMi00ZWM3LWEyOTQtZjIyODU3NDQzOTFiIiwidXNlcl90eXBlIjoiQkVORUZJQ0lBUlkiLCJtb2JpbGVfbnVtYmVyIjo5NzMxMDA0NDc2LCJiZW5lZmljaWFyeV9yZWZlcmVuY2VfaWQiOjk4MjEyMTU3NTAzODMwLCJ1YSI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzE1XzcpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS85MC4wLjQ0MzAuODUgU2FmYXJpLzUzNy4zNiIsImRhdGVfbW9kaWZpZWQiOiIyMDIxLTA1LTAzVDA5OjA0OjQ4LjU2OFoiLCJpYXQiOjE2MjAwMzI2ODgsImV4cCI6MTYyMDAzMzU4OH0.upw9pkBh10ULd1fzDmgVsjqcVQGtHTn-Bizi8oJxUu8",
                "if-none-match": "W/\"32d47-Da8bDhkxybJleiHJGpTes39jYxI\"",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site"
            },
            "referrer": "https://selfregistration.cowin.gov.in/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors"
            }).then(async response => {
                if (response.ok) {
                    const json = await response.json();
                    resolve(json)
                    fetchInProgress = false;
                } else {
                    reject(new Error('Respnse is not OK'))
                    fetchInProgress = false;
                }
            }, error => {
                reject(new Error(error.message))
                fetchInProgress = false;
            })
      })
    
}

startProgram();