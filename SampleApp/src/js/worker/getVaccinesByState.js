onmessage = (event) => {
    //define the array
    let districts = event.data;
    let currentDistrict="";
    let districtsData=[];

    let getDistrictData = (district) => {
        currentDistrict=district;
        return new Promise(async (resolve) => {
            let todayDate = (new Intl.DateTimeFormat('en-GB', { day: 'numeric', year: 'numeric', month: '2-digit' }).format(new Date())).replace(/\//ig, '-');
            await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district.value}&date=${todayDate}`).then(response => {
                setTimeout(() => resolve(response.json()), 500)
            })
        })
    }

    let getAllDistrictsData = (index) => {
        getDistrictData(districts[index]).then((response) => {
            districtsData.push({'district':currentDistrict,centers:response.centers});
            if (index < districts.length - 1) {
                index += 1;
                getAllDistrictsData(index);
            }
            else{
                postMessage(districtsData)
            }
        })
    }

    getAllDistrictsData(0)
}