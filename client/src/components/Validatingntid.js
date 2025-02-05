 //getting id from encrypted token after decoding with jwtdecode('token')

const validatingNtid= async (ntid,id) => { //function taking ntid as parameter and uses async await to handle asynchronous perations
  console.log(ntid,'got ntid')
  localStorage.setItem('ntid',ntid);
  try {
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/validatentid`, { // fetch is the inbuild js function to make http request 
      method: 'POST', //post  method of crud operations to send  or post data to server
      headers: {
        'Content-Type': 'application/json', // this indicates we are sending data as json format    
      },
      body: JSON.stringify({ ntid,id }), // Passing ntid in the body as JSON and json.stringify used to convert data to json string
    });

    if (response.status === 200) { //check status success of 200
      const data = await response.json(); // Get JSON data from response
      return data;
    } else {
      console.error('Failed to validate NTID', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error validating NTID:', error);
    return null;
  }
};
export default validatingNtid ;
//async await doesnt block  execution of code while waiting for response  with out using then() and  catch()