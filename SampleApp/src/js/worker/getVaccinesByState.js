onmessage = async (event) => {
    console.log("EVENT ", event);
    try {
        if (Array.isArray(event.data)) {
            let sessions = [];
            let itr = getSessions(event.data);
            let distCount=0;
            for (let i = 0; i < event.data.length; i++) {
                itr.next().then(data => {
                    distCount+=1;
                    data.value.centers.map(center => {
                        sessions=[...sessions,...center.sessions.map(session=>{
                            return {"district":currentDistrict,"available":session.available_capacity,"date":session.date,"dose1":session.available_capacity_dose1,"dose2":session.available_capacity_dose2,"age":session.min_age_limit}
                        })]
                    });
                    postMessage({"districts":distCount,"sessions":{"district":currentDistrict,"data":sessions},"status":"ok"});
                })
            }
        }
        else {
            postMessage("error-Districts not received correctly");
        }
    }
    catch (e) {
        postMessage({"status":"error"});
    }
}

var sessions = [];
var currentDistrict="";

async function* getSessions(districts) {
    for (let district of districts) {
        console.log("DISTRICT IS ", district);
        currentDistrict=district.label;
        let response = await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district.value}&date=15-05-2021`);
        await new Promise(r => setTimeout(r, 300));
        yield await response.json();
    }
}