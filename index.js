const fetch = require('node-fetch');
const jsonDiff = require('json-diff')
const notifier = require('node-notifier');
const config = require('./config');

let resMaster = [];
let counter = 1;
let fetchInProgress = false;

async function startProgram(){
    console.log(config);
    while(true){
        counter++;
        if(counter % 100000 == 0 && !fetchInProgress){
            fetchInProgress = true;
            try{
                let centers = await fetchCenters();
            
                let diff = jsonDiff.diff(centers, resMaster);

                if(diff){
                    console.log('\u0007');
                    console.log('Detected change');
                    console.log(diff);
                    notifier.notify(JSON.stringify(diff));

                }
                resMaster = centers;
            }catch(error){
                console.error(error);
            }
        }

        if(counter > 1000000){
            counter = 0;
        }
    }
}


async function fetchCenters(){
    return new Promise((resolve, reject) => {
        return fetch("https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=294&date=03-05-2021", {
            "headers": {
              "accept": "application/json, text/plain, */*",
              "accept-language": "en-US,en;q=0.9,hi;q=0.8",
              "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
              "sec-ch-ua-mobile": "?0",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "cross-site"
            },
            "referrer": "https://www.cowin.gov.in/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors"
          }).then(async response => {
                try{
                    if (response.ok) {
                        try{
                            const json = await response.json();
                            const result = [];
                            json.centers.filter((center) => {
                                if(center.sessions.length > 0){
                                    center.sessions.filter((session) => {
                                        if(session['min_age_limit'] == 18 && session['available_capacity'] > 0){
                                            result.push({
                                                name: center.name,
                                                capacity: session['available_capacity'],
                                                pincode: center.pincode
            
                                            })
                                        }
                                    })
                                }
                            })
                            fetchInProgress = false;
                            console.log("PASS");
                            resolve(result)
                        }catch(error){
                            fetchInProgress = false;
                            reject(new Error(error.message))
                        }
                    } else {
                        fetchInProgress = false;
                        // response.text().then(text => reject(new Error(text)));
                        reject(new Error("Unknown"))
                    }
                }catch(error){
                    fetchInProgress = false;
                    reject(new Error(error.message))
                }
                
            }, error => {
                reject(new Error(error.message))
                fetchInProgress = false;
            })
      })
    
}

startProgram();