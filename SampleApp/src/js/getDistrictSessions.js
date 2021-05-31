define([], function () {
    async function getDistrictData(district) {
        return new Promise(async (resolve, reject) => {
            console.log("DISTRIC RECVD. IS ", district);
            let todaysDate = (new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: '2-digit' }).format(new Date())).replace(/\//ig, '-');

            let url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district}&date=${todaysDate}`
            await fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw "error"
                    }
                    else {
                        response.json().then(data => {
                            console.log("DATA IS ", data);
                            let sessions45 = { "d1": 0, "d2": 0, data: [] };
                            let sessions18 = { "d1": 0, "d2": 0, data: [] };
                            data.centers.map(center => {
                                let address = center.name + "-" + center.pincode
                                for (let session of center.sessions) {
                                    session.address = address;
                                    if (session.min_age_limit == 45) {
                                        let ssnIndx=sessions45.data.findIndex(ssn=>{
                                            if((ssn.address==address) && (ssn.vaccine==session.vaccine)){
                                                return ssn;
                                            }
                                        });
                                        if(ssnIndx==-1){
                                            console.log("ADDING NEW SESSION 45 OBJ ",JSON.stringify(session));
                                            sessions45.data.push(session)
                                        }
                                        else{
                                            for(let key of Object.keys(sessions45.data[ssnIndx])){
                                                if(!session[key]){
                                                    console.log("UPDATING ",JSON.stringify(sessions45.data[ssnIndx])," to ",JSON.stringify(session))
                                                    sessions45.data[ssnIndx][key]=session[key];
                                                    console.log(session.address," ",key," ",sessions45.data[ssnIndx][key]," ",session[key])
                                                }
                                            }                                            
                                        }
                                        if(session.available_capacity_dose1>0){
                                            sessions45.d1+=session.available_capacity_dose1
                                        }
                                        if(session.available_capacity_dose2>0){
                                            sessions45.d2+=session.available_capacity_dose2
                                        }
                                    }
                                    else if (session.min_age_limit == 18) {
                                        sessions18.data.push(session);
                                        let ssnIndx=sessions18.data.findIndex(ssn=>{
                                            if((ssn.address==address) && (ssn.vaccine==session.vaccine)){
                                                return ssn;
                                            }
                                        });
                                        if(ssnIndx==-1){
                                            console.log("ADDING NEW SESSION 18 OBJ ",session);
                                            sessions18.data.push(session)
                                        }
                                        else{
                                            for(let key of Object.keys(sessions18.data[ssnIndx])){
                                                if(!session[key]){
                                                    console.log("UPDATING 18 OBJ ",sessions18.data[ssnIndx]," to ",session)
                                                    sessions18.data[ssnIndx][key]=session[key];
                                                    console.log(session.address," ",key," ",sessions18.data[ssnIndx][key]," ",session[key])
                                                }
                                            }                                            
                                        }
                                        if(session.available_capacity_dose1>0){
                                            sessions18.d1+=session.available_capacity_dose1
                                        }
                                        if(session.available_capacity_dose2>0){
                                            sessions18.d2+=session.available_capacity_dose2
                                        }
                                    }
                                }
                            });

                            let unavlablSessions45 = [];
                            let sessions45Arr = [];
                            sessions45.data.map(session => {
                                let obj = {};

                                obj["address"] = session.address;

                                obj[session.date] = session.available_capacity + "-" + session.min_age_limit + "-" + session.vaccine + "-" + session.available_capacity_dose1 + "-" + session.available_capacity_dose2;

                                if (session.available_capacity > 0) {
                                   sessions45Arr.push(obj);
                                }
                                else {
                                    unavlablSessions45.push(obj)
                                }

                            });

                            let unavlablSessions18 = [];
                            let sessions18Arr = [];
                            sessions18.data.map(session => {
                                let obj = {};

                                obj["address"] = session.address;

                                obj[session.date] = session.available_capacity + "-" + session.min_age_limit + "-" + session.vaccine + "-" + session.available_capacity_dose1 + "-" + session.available_capacity_dose2;

                                if (session.available_capacity > 0) {                                   
                                    sessions18Arr.push(obj);
                                }
                                else{
                                    unavlablSessions18.push(obj);
                                }
                            });

                            let summary={18:sessions18Arr,45:sessions45Arr,"unavlbl45":unavlablSessions45,"unavlbl18":unavlablSessions18,"18-d1":sessions18.d1,"18-d2":sessions18.d2,"45-d1":sessions45.d1,"45-d2":sessions18.d2};
                            resolve(summary);
                        });

                    }
                }).catch(e => {
                    reject(e)
                })
        })
    }
    return getDistrictData;
})