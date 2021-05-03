const fetch = require('node-fetch');
const jsonDiff = require('json-diff')
const notifier = require('node-notifier');
const config = require('./config');

let resMaster = [];
let counter = 1;
let fetchInProgress = false;
let timeDiff = 0;
let timestamp = Date.now()/1000

async function startProgram(){
    console.log("Checking slots for "+config.minAgeRequirement+"+ for the district ID="+config.districtId+" and date="+config.date);
    console.log("\n\nCurrent config:");
    console.log(config);
    console.log("\n\nPlease edit config.json as per your need\n\n");
    while(true){
        timeDiff = (Date.now()/1000) - timestamp;
        if(timeDiff % config.delayInSeconds == 0 && !fetchInProgress){
            fetchInProgress = true;
            timestamp += timeDiff;
            try{
                let centers = await fetchCenters();
            
                let diff = jsonDiff.diff(centers, resMaster);

                if(diff){
                    console.log('\u0007');
                    console.log('Detected change');
                    console.log(diff);
                    notifier.notify(JSON.stringify(diff));
                }else{
                    console.log("No change")
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
        return fetch("https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id="+config.districtId+"&date="+config.date, {
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
                                        if((session['min_age_limit'] == config.minAgeRequirement) && (session['available_capacity'] >= config.minSlotsRequired)){
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