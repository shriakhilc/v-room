import { redirect } from "next/dist/server/api-utils";
import React from "react"
import { Navigate } from "react-router-dom";

export default function PageWithJSbasedForm() {

   
    // Handles the submit event on form submit.
    const handleSubmit = async (event:any) => {
        try {
          console.log("aaaaaaaaaaaaaaaaaaaaaaaa");
          // Stop the form from submitting and refreshing the page.
          event.preventDefault()
          const email=document.getElementsByClassName('email')[0]?.innerHTML;
          // Get data from the form.
          const dataObj = {
            data:{
                name: event.target.name.value,
                pronoun: event.target.pronouns.value,
                isRegistered:true
            },
            email
          }
      
          // Send the data to the server in JSON format.
          const JSONdata = JSON.stringify(dataObj)
          console.log('aagggg ',JSONdata);
          // API endpoint where we send form data.
          const endpoint = '/api/user/update'
      
          // Form the request for sending data to the server.
          const options = {
            // The method is POST because we are sending data.
            method: 'PUT',
            // Tell the server we're sending JSON.
            headers: {
              'Content-Type': 'application/json',
            },
            // Body of the request is the JSON data we created above.
            body: JSONdata,
          }
      
          // Send the form data to our forms API on Vercel and get a response.
          const response = await fetch(endpoint, options)
      
        //   // Get the response data from server as JSON.
        //   // If server returns the name submitted, that means the form works.
          const result = await response.json()
          console.log("11111111 ",result);
          alert(`Is this your full name: ${result.result.name}`)
          return <Navigate to="/dashboard" replace />;
        
        } catch (error) {
            console.log("errrorrr ",error);
        }
       
    }
    return (
      // We pass the event to the handleSubmit() function on submit.
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" required />
  
        <label htmlFor="pronoun">Pronouns</label>
        <select id="pronouns" name="pronouns">
        <option value="He/Him">He/Him</option>
        <option value="She/Her">She/Her</option>
        <option value="They/Them">They/Them</option>
        </select>
  
        <button type="submit">Submit</button>
      </form>
    )
  }