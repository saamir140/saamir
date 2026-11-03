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
  const subject = encodeURIComponent('E-commerce enquiry — ' + data.get('interest'));
  const body = encodeURIComponent(
    `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nService: ${data.get('interest')}\nBusiness stage: ${data.get('stage')}\nWebsite: ${data.get('website') || 'Not provided'}\nMain priority: ${data.get('challenge') || 'Not specified'}\n\nBusiness details:\n${data.get('message') || 'Not provided'}`
  );
  const note = document.getElementById('formNote');
  if (recipient === 'YOUR_EMAIL_ADDRESS') {
    note.textContent = 'The enquiry form is ready, but the business email has not been connected yet. Add your real email in script.js before publishing.';
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
