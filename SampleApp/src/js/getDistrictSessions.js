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

                            let allSessions45 = [];
                            let allSessions18 = [];
                            let unavlbl45 = [];
                            let unavlbl18 = [];
                            let sessions18d1 = 0;
                            let sessions45d1 = 0;
                            let sessions18d2 = 0;
                            let sessions45d2 = 0;


                            data.centers.map(center => {
                                let obj = {};
                                obj["address"] = center.name + "-" + center.pincode;
                                for (let dt of getCurrentWeekDates().dateCols) {
                                    obj[dt] = [];
                                }
                                let addCount = 0;
                                center.sessions.map(session => {
                                    if (session.min_age_limit == 45) {
                                        if (session.available_capacity > 0) {
                                            addCount += 1;
                                            if (session.available_capacity_dose1 > 0) {
                                                sessions45d1 += 1
                                            }
                                            if (session.available_capacity_dose2 > 0) {
                                                sessions45d2 += 1
                                            }
                                            obj[session.date].push(session.available_capacity + "-" + session.min_age_limit + "-" + session.vaccine + "-" + session.available_capacity_dose1 + "-" + session.available_capacity_dose2);
                                        }
                                    }
                                })
                                if (addCount)
                                    allSessions45.push(obj);
                            });

                            data.centers.map(center => {
                                let obj = {};
                                obj["address"] = center.name + "-" + center.pincode;
                                for (let dt of getCurrentWeekDates().dateCols) {
                                    obj[dt] = [];
                                }
                                let addCount = 0;
                                center.sessions.map(session => {
                                    if (session.min_age_limit == 45) {
                                        addCount += 1;
                                        if (session.available_capacity == 0) {
                                            obj[session.date].push(session.available_capacity + "-" + session.min_age_limit + "-" + session.vaccine + "-" + session.available_capacity_dose1 + "-" + session.available_capacity_dose2);
                                        }
                                    }
                                })
                                if (addCount)
                                    unavlbl45.push(obj);
                            });

                            console.log("ALL SESSIONS 45 ", allSessions45);
                            console.log("UNAVLBL 45 ", unavlbl45);
                            console.log("Dose 1 ", sessions45d1);
                            console.log("Dose 2 ", sessions45d2);

                            data.centers.map(center => {
                                let obj = {};
                                obj["address"] = center.name + "-" + center.pincode;
                                for (let dt of getCurrentWeekDates().dateCols) {
                                    obj[dt] = [];
                                }
                                let addCount = 0;
                                center.sessions.map(session => {
                                    if (session.min_age_limit == 18) {
                                        if (session.available_capacity > 0) {
                                            addCount += 1;
                                            if (session.available_capacity_dose1 > 0) {
                                                sessions18d1 += 1
                                            }
                                            if (session.available_capacity_dose2 > 0) {
                                                sessions18d2 += 1
                                            }
                                            obj[session.date].push(session.available_capacity + "-" + session.min_age_limit + "-" + session.vaccine + "-" + session.available_capacity_dose1 + "-" + session.available_capacity_dose2);
                                        }
                                    }
                                })
                                if (addCount)
                                    allSessions18.push(obj);
                            });

                            data.centers.map(center => {
                                let obj = {};
                                obj["address"] = center.name + "-" + center.pincode;
                                for (let dt of getCurrentWeekDates().dateCols) {
                                    obj[dt] = [];
                                }
                                let addCount = 0;
                                center.sessions.map(session => {
                                    if (session.min_age_limit == 18) {
                                        addCount += 1;
                                        if (session.available_capacity == 0) {
                                            obj[session.date].push(session.available_capacity + "-" + session.min_age_limit + "-" + session.vaccine + "-" + session.available_capacity_dose1 + "-" + session.available_capacity_dose2);
                                        }
                                    }
                                })
                                if (addCount)
                                    unavlbl18.push(obj);
                            });

                            console.log("ALL SESSIONS 18 ", allSessions18);
                            console.log("UNAVLBL 18 ", unavlbl18);
                            console.log("Dose 1 ", sessions18d1);
                            console.log("Dose 2 ", sessions18d2);

                            let summary = { "18": allSessions18, "45": allSessions45, "18-d1": sessions18d1, "18-d2": sessions18d2, "45-d1": sessions45d1, "45-d2": sessions45d2, unavlbl18, unavlbl45 };
                            resolve(summary);
                        });
                    }
                }).catch(e => {
                    reject(e)
                })
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

    return getDistrictData;
})