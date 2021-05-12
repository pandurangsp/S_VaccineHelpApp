onmessage=async (event)=>{
    await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${event.data}&date=12-05-2021`)
    .then(response => response.json())
    .then(data => postMessage(data)).catch(()=>{
        postMessage("error");
    })
}