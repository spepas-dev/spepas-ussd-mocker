// import axios from "./axios";
// import axios from "axios";
import apiClient from './axios';

export const baseEndpoint = async (data: unknown) => {
  try {
    const response = await apiClient.post('/base/seller', data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
