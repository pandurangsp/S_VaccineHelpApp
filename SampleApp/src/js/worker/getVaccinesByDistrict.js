onmessage = (event) => {
    let districts = event.data;

    let districtRows = [];

    console.log("DISTRICTS RECVD. ", districts);
    let currentDistrict = "";
    let currentDate = "";
    let vaccinesArr = [];
    let dstProcessedCount = 0;

    getDoseAvlblty = (date, sessions) => {
        currentDate = date;
        return new Promise(resolve => {
            let vals = sessions.filter(session => {
                if (session.date == date) {
                    return session;
                }
            })

            if (vals.length > 0) {
                if (vals.length == 1) {
                    let obj = {};
                    obj["name"] = vals[0].vaccine
                    obj["avlbl"] = vals[0].available_capacity;
                    obj["date"] = vals[0].date;
                    obj["district"] = currentDistrict;
                    obj["age"] = vals[0].min_age_limit;
                    obj["sessions"] = [...vals];
                    
                    setTimeout(() => resolve([obj]), 300);
                }
                else {
                    for (session of vals) {
                        let vaccIndex = vaccinesArr.findIndex(vacc => {
                            return (vacc.age == session.min_age_limit) && (vacc.name == session.vaccine) && (vacc.date == session.date) && (vacc.district == currentDistrict)
                        })
                        if (vaccIndex == -1) {
                            let obj = {};
                            obj["name"] = session.vaccine
                            obj["avlbl"] = session.available_capacity;
                            obj["date"] = session.date;
                            obj["district"] = currentDistrict;
                            obj["age"] = session.min_age_limit;
                            obj["sessions"] = [...vals];
                            vaccinesArr.push(obj);
                        }
                        else {
                            let vacc = vaccinesArr[vaccIndex];
                            vacc.avlbl += session.available_capacity;
                            vaccinesArr.splice(vaccIndex, 1, vacc);
                        }
                    }
                    setTimeout(() => resolve(vaccinesArr), 300);
                }
            }
            else {
                let obj = {};
                obj["name"] = null;
                obj["district"] = currentDistrict;
                obj["date"] = currentDate;
                obj["sessions"] = [];
                setTimeout(() => resolve([obj]), 300);
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

    let dates = null;
    let districtSessions = [];
    let sessions = [];
    let isComplete = false;

    getDosesData = (dateIndx, distrctIndx) => {
        if (!dates) {
            dates = getCurrentWeekDates().dateCols;
            districtRows = districts.map(district => {
                let obj = {};
                obj["district"] = district.district.label;
                dates.map(date => {
                    obj[date] = "";
                })
                return obj;
            })
            console.log("districtRows ", districtRows);
        }
        console.log("DISTRICT IS ",districts[distrctIndx]);
        currentDistrict = districts[distrctIndx].district.label;
        currentDistrictid = districts[distrctIndx].district.value;
        console.log("currentDistrictid ",currentDistrictid);
        districts[distrctIndx].centers.map(center => {
            sessions = [...sessions, ...center.sessions]
        });

        getDoseAvlblty(dates[dateIndx], sessions).then(data => {
            console.log("DATA IS ", data)

            for (let i = 0; i < districtRows.length; i++) {
                if ((districtRows[i].district == currentDistrict)) {
                    let rows = data.filter(dstrct => {
                        if ((dstrct.district == currentDistrict) && (dstrct.date == currentDate)) {
                            return dstrct
                        }
                    });
                    console.log("ROWS ARE ", rows);

                    districtRows[i][currentDate] = rows.map(row => row)
                }
                if ((districtRows[i].district == currentDistrict)) {
                    districtRows[i]["id"] = currentDistrictid;
                }
            }

            console.log("DISTRICTS ARE ", districtRows);
            postMessage({ allDistricts: districtRows, isComplete, dstProcessedCount });
            if (dateIndx < dates.length - 1) {
                dateIndx += 1;
                if ((distrctIndx == districts.length - 1) && (dateIndx == dates.length - 1)) {
                    isComplete = true;
                }
                getDosesData(dateIndx, distrctIndx, isComplete);
            }
            else {
                if (distrctIndx < districts.length - 1) {
                    dateIndx = 0;
                    distrctIndx += 1;
                    dstProcessedCount += 1;
                    getDosesData(dateIndx, distrctIndx, isComplete);
                }
            }
        })
    }
    getDosesData(0, 0);
}