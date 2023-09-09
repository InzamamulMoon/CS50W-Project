//LEFT OFF AT REPLY

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  //Send Email 
  document.querySelector('#submit').addEventListener('click', sent_email);
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display='none';
  document.querySelector('#compose-view').style.display = 'block';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content').style.display='none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    emails.forEach(email => {
        // Create div for each email
        const element= document.createElement('div');
        if(!email.read){
        element.className="list-group-item list-group-item-action";
        element.innerHTML = `<p><strong>${email.sender}</strong> ${email.subject} ${email.timestamp}</p>`;
       }
       else{
         element.className="list-group-item list-group-item-action list-group-item-secondary"
         element.innerHTML = `<p><strong>${email.sender}</strong> ${email.subject} ${email.timestamp}</p>`;
       }
        element.addEventListener('click', function() {
        render_email(email.id)
        console.log('This element has been clicked!');
       })
       document.querySelector('#emails-view').append(element);
     });      
    });
  };


    
//Submit Email
function sent_email(event){
  event.preventDefault();
     document.querySelector('#submit').addEventListener('click', ()=> { 
      const person= document.querySelector('#compose-recipients').value;
      const topic=document.querySelector('#compose-subject').value;
      const core= document.querySelector('#compose-body').value;

      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients:person,
            subject:topic,
            body:core
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
      });
    });
};

function render_email(id){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content').style.display='block';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    console.log(email);
    const content = document.querySelector('#email-content');
    //container.className=
    content.innerHTML= `<p><strong>From: </strong> ${email.sender}</p>
    <p><strong>To: </strong> ${email.recipients}</p>
    <p><strong>Subject: </strong> ${email.subject}</p>
    <p><strong>Timestamp: </strong> ${email.timestamp}</p>
    <br>
    <hr>
    <p>${email.body}</p>`;
    //content.innerHTML=`<p>${email.body}</p>`
    
    // ... do something else with email ...

    if(!email.read){
      fetch('/emails/'+ id, {
        method: 'PUT',
        body: JSON.stringify({
          read:true})
     })
   };

   if(!email.archived)
   { const Archive=document.createElement('button');
   Archive.innerHTML=`Archive`;
   Archive.className="btn btn-success"
   Archive.addEventListener('click', function(){
    fetch('/emails/'+ id, {
      method: 'PUT',
      body: JSON.stringify({
        archived:true}) })
    .then(()=>load_mailbox('inbox'))
      })
      document.querySelector('#email-content').append(Archive);
   }
   else{
    const Unarchive=document.createElement('button');
    Unarchive.innerHTML=`Unarchive`;
    Unarchive.className="btn btn-danger"
    Unarchive.addEventListener('click', function(){
    fetch('/emails/'+ id , {
      method: 'PUT',
      body: JSON.stringify({
        archived:false}) })
    .then(()=>load_mailbox('inbox'))
      })
     document.querySelector('#email-content').append(Unarchive);
   }
  const reply=document.createElement('button');
  reply.innerHTML=`Reply`;
  reply.className="btn btn-primary"
  reply.addEventListener('click', function(){
    //console.log("HEY THERE!")
    compose_email();
    const subject=email.subject;
    document.querySelector('#compose-recipients').value = ` ${email.sender}`;
    if(subject.includes("Re: ")){
     document.querySelector('#compose-subject').value = `${email.subject}`;
    }
    else{
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  })
  document.querySelector('#email-content').append(reply);
 }); 
  
  
 
}