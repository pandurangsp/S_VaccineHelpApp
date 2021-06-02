onmessage = (event) => {
    let districts = event.data;

    let districtRows = [];

    console.log("DISTRICTS RECVD. ", districts);
    let currentDistrict = "";
    let currentDistrictid="";
    let dstProcessedCount = 0;

    getDoseAvlblty = (district, centers) => {
        return new Promise(resolve => {
            let obj = {};
            obj["district"] = district;
            obj["id"]=currentDistrictid;
            for (let dt of getCurrentWeekDates().dateCols) {
                obj[dt] = [];
            }

            centers.map(center => { 
                for (let dt of getCurrentWeekDates().dateCols) {
                    //Get all sessions for that date
                    let dtSessions=center.sessions.filter(session=>session.date==dt);
                    obj["sessions"]=center.sessions;

                    console.log("SESSION for ",dt," are ",dtSessions);
                    for(let ssn of dtSessions){

                        //Check if vaccine details exist, vaccine given for that particular age, for that particular date
                        let indx=obj[dt].findIndex(vaccSsn=>{
                            return ((vaccSsn.vaccine==ssn.vaccine) && (vaccSsn.age==ssn.min_age_limit))
                        });

                        if(indx==-1){
                            //Add new vaccine details, vaccine given for that particular age, for that particular date
                            obj[dt].push({"vaccine":ssn.vaccine,"d1":ssn.available_capacity_dose1,"d2":ssn.available_capacity_dose2,"total":ssn.available_capacity,"age":ssn.min_age_limit});
                        }
                        else{
                            //Add to the existing vaccine detail, vaccine given for that particular age, for that particular date
                            let vaccObj=obj[dt][indx];
                            console.log("BEFOR UPDATING ",vaccObj)
                            vaccObj["d1"]+=ssn.available_capacity_dose1;
                            vaccObj["d2"]+=ssn.available_capacity_dose2;
                            vaccObj["total"]+=ssn.available_capacity;
                            vaccObj["age"]=ssn.min_age_limit;
                            obj[dt].splice(indx,1,vaccObj);
                            console.log("AFTER UPDATING ",obj[dt][indx]);
                        }
                    }
                }                
            });
            dstProcessedCount+=1;
            setTimeout(()=>resolve(obj),300);
        });
    }

    let isComplete = false;

    getDosesData = (distrctIndx) => {
        console.log("DISTRICT IS ", districts[distrctIndx]);
        currentDistrict = districts[distrctIndx].district.label;
        currentDistrictid = districts[distrctIndx].district.value;

        getDoseAvlblty(currentDistrict, districts[distrctIndx].centers).then(data => {
            districtRows.push(data);
            console.log("DISTRICTS DATA ",districtRows," isComplete ",isComplete);
            postMessage({ allDistricts: districtRows, isComplete, dstProcessedCount });

            if (distrctIndx < districts.length - 1) {
                if(distrctIndx == districts.length - 2)
                    isComplete=true;
                else    
                    isComplete=false;

                distrctIndx += 1;
                getDosesData(distrctIndx);
            }
            
        })
    }
    
    getCurrentWeekDates = () => {
        let weekBgnDt = new Date();
        let weekEndDt = new Date();
        let wBeginDateLng, wEndDateLng, diffDays, dateCols = [];

        if (weekBgnDt.getDay() > 0) {
            diffDays = 0 - weekBgnDt.getDay();
            //weekBgnDt.setDate(weekBgnDt.getDate() + diffDays)
        }
        weekEndDt = weekEndDt.setDate(weekBgnDt.getDate() + 6)

        wBeginDate = (new Intl.DateTimeFormat('en-GB', { day: '2-digit', year: 'numeric', month: '2-digit' }).format(weekBgnDt)).replace(/\//ig, '-');
        wEndDate = (new Intl.DateTimeFormat('en-GB', { day: '2-digit', year: 'numeric', month: '2-digit' }).format(weekEndDt)).replace(/\//ig, '-');

        wBeginDateLng = (new Intl.DateTimeFormat('en-GB', { day: '2-digit', year: 'numeric', month: 'long' }).format(weekBgnDt)).replace(/\//ig, '-');
        wEndDateLng = (new Intl.DateTimeFormat('en-GB', { day: '2-digit', year: 'numeric', month: 'long' }).format(weekEndDt)).replace(/\//ig, '-');

        for (let i = weekBgnDt; i <= weekEndDt;) {
            dateCols.push((new Intl.DateTimeFormat('en-GB', { day: '2-digit', year: 'numeric', month: '2-digit' }).format(i)).replace(/\//ig, '-'));
            i = weekBgnDt.setDate(weekBgnDt.getDate() + 1)
        }


        return { wBeginDate, wBeginDateLng, wEndDate, wEndDateLng, dateCols };
    }

    getDosesData(0);

}