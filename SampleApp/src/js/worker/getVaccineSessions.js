onmessage=async (event)=>{
    await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${event.data.pincode}&date=${event.data.date}`)
    .then(response =>{
        if(!response.ok){
            throw "error"
        }
        else{
            return response.json()
        }
        
    })
    .then(data => postMessage(data))
    .catch((e)=>{
        console.log("ERROR ",e);
        postMessage("error")
    })
}