// script.js

// Utility to convert "HH:MM" → "h:MM AM/PM"
function formatTime12(input) {
  let [h, m] = input.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
}

document.addEventListener('DOMContentLoaded', () => {
  // ▶️ 1) Menu toggle + persistence
  const menuBtn = document.getElementById('menu-toggle');
  menuBtn.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('menu-open');
    localStorage.setItem('menuOpen', isOpen);
  });
  if (localStorage.getItem('menuOpen') === 'true') {
    document.body.classList.add('menu-open');
  }

  // ▶️ 1a) Close menu when any nav link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      localStorage.setItem('menuOpen', 'false');
    });
  });

  // ▶️ 2) Click/tap outside sidebar or toggle → close menu
  document.addEventListener('click', e => {
    if (!document.body.classList.contains('menu-open')) return;
    if (e.target.closest('.sidebar') || e.target.closest('#menu-toggle')) return;
    document.body.classList.remove('menu-open');
    localStorage.setItem('menuOpen', 'false');
  });

  // ▶️ 3) Fade-in on scroll
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.fade-item').forEach(el => observer.observe(el));

  // ▶️ 4) Add-on buttons toggle
  document.querySelectorAll('.addon-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('active'));
  });

  // ▶️ 5) Booking form submission → EmailJS → reload for reset & fade replay
  const form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      // Gather template parameters
      const params = {
        user_name:    form.name.value,
        user_phone:   form.phone.value,
        user_address: form.address.value,
        user_email:   form.email.value,
        booking_date: form.date.value,
        booking_time: formatTime12(form.time.value),
        service_type: form.service.value,
        addon_salt:   document.getElementById('saltRemoval').classList.contains('active')
                          ? 'Yes (+$30)' : 'No',
        addon_hair:   document.getElementById('hairRemoval').classList.contains('active')
                          ? 'Yes (+$40)' : 'No',
        addon_vomit:  document.getElementById('vomitRemoval').classList.contains('active')
                          ? 'Yes (+$50)' : 'No',
        addon_roof_rack:  document.getElementById('roofRack').classList.contains('active')
                          ? 'Yes (+$10)' : 'No',
        addon_baby_seat:  document.getElementById('babySeat').classList.contains('active')
                          ? 'Yes (+$10)' : 'No'
      };

      // Send via EmailJS
      emailjs.send('service_plxgh2f', 'template_a1sctas', params)
        .then(() => {
          // Flag for post-reload thank-you overlay
          localStorage.setItem('bs_thankYou', '1');
          // Reload back to this page (resets add-ons, replay fades)
          window.location.href = 'booknow.html';
        })
        .catch(err => {
          console.error('EmailJS error:', err);
          alert('Oops—something went wrong. Please try again.');
        });
    });
  }
});

// ▶️ 6) After full load, show Thank You for a moment if flagged
window.addEventListener('load', () => {
  const thankYou    = document.getElementById('thankYouMessage');
  const fadeDelay   = 100;   // wait for CSS fade-in
  const showLength  = 1500;  // how long to display

  if (localStorage.getItem('bs_thankYou')) {
    setTimeout(() => {
      thankYou.style.display = 'block';
      setTimeout(() => {
        thankYou.style.display = 'none';
      }, showLength);
    }, fadeDelay);
    localStorage.removeItem('bs_thankYou');
  }
});
