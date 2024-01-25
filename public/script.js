function submitForm() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;
  
    const data = {
      name: name,
      email: email,
      password: password,
      address: address,
      phone: phone,
    };
  
    fetch("http://localhost:3000/ind", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(result => {
        if(!result.success){
          alert("Invalid credentials");}
        else{ alert("Signup succcessful");
        window.location.href = `/`;
      }
      })
      .catch(error => console.error("Error:", error));
  }



  function submitResForm() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const address = document.getElementById("address").value;
  
    const data = {
      name: name,
      email: email,
      password: password,
      address: address,
    };
  
    fetch("http://localhost:3000/restsignup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(result => {
        if(!result.success){
          alert("Invalid credentials");}
        else{ alert("Signup succcessful");
        window.location.href = `/`;
      }
      
      })
      .catch(error => console.error("Error:", error));
  }