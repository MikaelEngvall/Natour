/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const editTour = async (tourId, tourData) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/tours/${tourId}`,
      data: tourData
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Tour updated successfully!');
      window.setTimeout(() => {
        location.assign('/manage-tours');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
export const deleteTour = async tourId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${tourId}`
    });

    if (res.status === 204) {
      showAlert('success', 'Tour deleted successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    throw err; // Re-throw the error so we can handle it in manageTours.pug
  }
};
