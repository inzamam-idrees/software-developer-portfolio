'use client';
import { useEffect, useRef, useState } from 'react';
import { validateContact } from '@/lib/contact.mjs';
const empty={name:'',email:'',message:''};
export default function ContactForm(){
 const [ready,setReady]=useState(false);useEffect(()=>setReady(true),[]);
 const [input,setInput]=useState(empty),[errors,setErrors]=useState({}),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);const sending=useRef(false);
 async function submit(event){
  event.preventDefault();if(sending.current)return;
  const result=validateContact(input);setErrors(result.ok?{}:result.errors);setStatus('');
  if(!result.ok){document.getElementById('contact-'+Object.keys(result.errors)[0])?.focus();return;}
  sending.current=true;setBusy(true);
  try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(result.data)});const data=await response.json();if(!response.ok||!data.success)throw new Error('Delivery failed');setInput(empty);setStatus('Message sent. Thank you for reaching out.');}
  catch{setStatus('Could not send your message. Please try again or email me directly.');}
  finally{sending.current=false;setBusy(false);}
 }
 return <form className="contact-form" onSubmit={submit} noValidate aria-label="Contact Inzamam"><div className="form-row">{[['name','Your name','text','name'],['email','Email address','email','email']].map(([field,label,type,autocomplete])=><div className="form-field" key={field}><label htmlFor={'contact-'+field}>{label}</label><input id={'contact-'+field} name={field} type={type} autoComplete={autocomplete} maxLength={100} required value={input[field]} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field]?field+'-error':undefined} onChange={e=>setInput({...input,[field]:e.target.value})}/>{errors[field]&&<p id={field+'-error'} className="field-error">{errors[field]}</p>}</div>)}</div><div className="form-field"><label htmlFor="contact-message">What are you building?</label><textarea id="contact-message" name="message" maxLength={500} rows={5} required value={input.message} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message?'message-error':undefined} onChange={e=>setInput({...input,message:e.target.value})}/>{errors.message&&<p id="message-error" className="field-error">{errors.message}</p>}</div><div className="form-submit"><button className="button primary" type="submit" disabled={busy||!ready}>{busy?'Sending…':'Send message'} <span aria-hidden="true">↗</span></button><p className="eyebrow muted">A CONVERSATION STARTS HERE.</p></div><p className="form-status" role="status" aria-live="polite" aria-atomic="true">{status}</p></form>;
}
