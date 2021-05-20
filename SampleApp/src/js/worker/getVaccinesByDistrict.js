onmessage = (event) => {
    let districts = event.data;
    console.log("DISTRICTS RECVD. ", districts);


    getDoseAvlblty = (date, sessions) => {
        console.log(date);
        console.log(sessions);
        return new Promise(resolve => {
            let vals = sessions.filter(session => {
                if (session.date == date) {
                    return session;
                }
            })

            if (vals.length > 0) {
                console.log("VALS ARE ",vals);
                if (vals.length == 1) {
                    vals[0][vals[0].vaccine] = vals[0].available_capacity;
                    if (!vals[0]['vaccineDtl']) {
                        vals[0]['vaccineDtl'] = {};
                        vals[0]['vaccineDtl'][vals[0].vaccine] = {};
                    }
                    vals[0]['vaccineDtl'][vals[0].vaccine][vals[0].min_age_limit] = vals[0].available_capacity;
                    let { date, vaccineDtl } = vals[0];
                    setTimeout(()=>resolve({ date, vaccineDtl }),300);
                }
                else{
                    let val = vals.reduce((acc, curr) => {
                        console.log("ACC ",acc)
                        console.log("CURR ",curr)

                        if (!acc['vaccineDtl']) {
                            acc['vaccineDtl'] = {};                                
                        }

                        if (!acc['vaccineDtl']['vaccines']) {
                            acc['vaccineDtl']['vaccines'] = [];                                
                        }

                        let ageIndex=acc['vaccineDtl']['vaccines'].findIndex(vacc=>vacc.age==curr.min_age_limit);
                        if(ageIndex==-1){
                            let obj={};
                            obj["age"]=curr.min_age_limit;
                            obj["avlbl"]=0;
                            obj["name"]=curr.vaccine;
                            acc['vaccineDtl']['vaccines'].push(obj);
                            ageIndex=acc['vaccineDtl']['vaccines'].length-1;
                        }

                        let vacc=acc['vaccineDtl']['vaccines'][ageIndex];
                        vacc.avlbl+=curr.available_capacity;
                        acc['vaccineDtl']['vaccines'][ageIndex]['avlbl']=vacc.avlbl;

                        console.log("RETURNING ACC ",acc);
                        return acc
                    });
                    let { date, vaccineDtl } = val
                    setTimeout(()=>resolve({ date, vaccineDtl }),300);
                }
            }
            else{
                setTimeout(()=>resolve({ date, 'vaccineDtl':{} }),300);
            }
        })
    }



    getCurrentWeekDates = () => {
        let weekBgnDt = new Date();
        let weekEndDt = new Date();
        let wBeginDateLng, wEndDateLng, diffDays, dateCols = [];

        if (weekBgnDt.getDay() > 0) {
            diffDays = 0 - weekBgnDt.getDay();
            weekBgnDt.setDate(weekBgnDt.getDate() + diffDays)
        }
        weekEndDt = weekEndDt.setDate(weekBgnDt.getDate() + 6)

        wBeginDate = (new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: '2-digit' }).format(weekBgnDt)).replace(/\//ig, '-');
        wEndDate = (new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: '2-digit' }).format(weekEndDt)).replace(/\//ig, '-');

        wBeginDateLng = (new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: 'long' }).format(weekBgnDt)).replace(/\//ig, '-');
        wEndDateLng = (new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: 'long' }).format(weekEndDt)).replace(/\//ig, '-');

        for (let i = weekBgnDt; i <= weekEndDt;) {
            dateCols.push((new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: '2-digit' }).format(i)).replace(/\//ig, '-'));
            i = weekBgnDt.setDate(weekBgnDt.getDate() + 1)
        }


        return { wBeginDate, wBeginDateLng, wEndDate, wEndDateLng, dateCols };
    }

    let dates=null;
    let districtSessions=[];
    let sessions=[];

    getDosesData=(dateIndx,distrctIndx)=>{
        
        if(!dates){
            dates=getCurrentWeekDates().dateCols;
        }
        districts[distrctIndx].centers.map(center => {
            sessions = [...sessions, ...center.sessions]
        });
        console.log("SESSIONS ARE ",sessions);

        getDoseAvlblty(dates[dateIndx],sessions).then(data=>{
            console.log("SESSIONS Data ",data);
            districtSessions.push({"district":districts[distrctIndx].value})
            if(dateIndx<dates.length-1){
                dateIndx+=1;
                getDosesData(dateIndx,distrctIndx);
            }
            else{
                if(distrctIndx<districts.length-1){
                    dateIndx=0;
                    distrctIndx+=1;
                    getDosesData(dateIndx,distrctIndx);
                }
                else{
                    postMessage()
                }
            }
        })
    }
    getDosesData(0,0);
}