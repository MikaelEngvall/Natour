/* eslint-disable */

import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { editTour, deleteTour } from './editTour';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');
const alertMessage = document.querySelector('body').dataset.alert;
const tourForm = document.querySelector('.form-tour-data');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating ...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
if (alertMessage) showAlert('success', alertMessage, 20);
if (tourForm)
  tourForm.addEventListener('submit', e => {
    e.preventDefault();
    const tourId = document.getElementById('tour-id').value;
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const duration = document.getElementById('duration').value;
    // Add other fields as necessary

    editTour(tourId, { name, price, duration });
  });
// Add event listeners after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.btn-delete-tour');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      const tourId = e.target.dataset.tourId;
      if (confirm('Are you sure you want to delete this tour?')) {
        await deleteTour(tourId);
      }
    });
  });
});
