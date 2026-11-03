const menuButton = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
const form = document.getElementById('enquiryForm');
if (form) form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const recipient = 'YOUR_EMAIL_ADDRESS'; // Replace with the real business email before publishing.
  const subject = encodeURIComponent('E-commerce business enquiry — ' + data.get('interest'));
  const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nInterested in: ${data.get('interest')}\n\nBusiness details:\n${data.get('message')}`);
  const note = document.getElementById('formNote');
  if (recipient === 'YOUR_EMAIL_ADDRESS') {
    note.textContent = 'Form layout is ready. Add your real business email in script.js before publishing so enquiries can be delivered.';
    return;
  }
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
});
document.querySelectorAll('[data-interest]').forEach(link => link.addEventListener('click', () => {
  const select = document.querySelector('select[name="interest"]');
  if (!select) return;
  const value = link.dataset.interest;
  const option = [...select.options].find(item => item.text.toLowerCase().includes(value.toLowerCase().slice(0, 12)));
  if (option) select.value = option.value;
}));
