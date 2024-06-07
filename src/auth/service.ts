import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance, AxiosError } from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();


interface MerchantApiResponse {
  accountInitiatorRef: string;
  accountName: string;
  accountNo: string;
  amount: number;
  completionDate: string;
  initiationDate: string;
  initiatorRef: string;
  sourceAccountName: string;
  sourceAccountNumber: string;
  sourceFinancialInstitution: string;
  ref: string;
  walletNo: string;
  accountMode: string;
  narration?: string;
}

interface IswGenerateAuthTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  merchantCode: string;
  productionPaymentCode: string;
  requestorID: string;
  payableID: string;
  jti: string;
}

const localCache: Record<string, any> = {};

export const QueryRemitterTransaction = async (startDate: string, reference: string): Promise<any> => {
  try {
    // const apiToken = process.env.MIDDLEWARE_TOKEN;  //2024-05-01
    const axiosInstance = setupAxiosInterceptors();
    const url = `${process.env.REMITTER_BASE_URL}/remita/frsc-requery?startDate=${startDate}&transactionRef=${reference}`;

    console.log(`Sending request to ${url} with dataz`);

    const response: AxiosResponse<any> = await axiosInstance.get(url);
    console.log(`Response from ${url}: ${JSON.stringify(response.data)}`);

    return response.data;
  } catch (error) {
    console.error('Exception:', error);
    throw error;
  }
};

export const merchantLookUp = async (apiData: string[]): Promise<MerchantApiResponse[]> => {
  try {
    // const apiToken = process.env.MIDDLEWARE_TOKEN;
    const axiosInstance = setupAxiosInterceptors();
    const url = `${process.env.MERCHANT_BASE_URL}/confirm-bulk-virtual-payment-frsc-app`;
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'frsc-secret': process.env.FRSC_SECRET
      },
      timeout: 15000,
    };

    console.log(`Sending request to ${url} with data: ${JSON.stringify(apiData)}`);

    const response: AxiosResponse<MerchantApiResponse[]> = await axiosInstance.post(url,{
      initiatorRefs: `FRSCpay|${apiData}`
    } , config);
    console.log(`Response from ${url}: ${JSON.stringify(response.data)}`);

    return response.data;
  } catch (error) {
    console.error('Exception:', error);
    throw error;
  }
};

export const remitterCategoryLookUp = async (): Promise<MerchantApiResponse> => {
  try {
    // const apiToken = process.env.MIDDLEWARE_TOKEN;
    const axiosInstance = setupAxiosInterceptors();
    const url = `${process.env.SANDBOX_BASE_URL}/remita/getBillerCategories`;

    console.log(`Sending request to ${url} with dataz`);

    const response: AxiosResponse<any> = await axiosInstance.get(url);
    console.log(`Response from ${url}: ${JSON.stringify(response.data)}`);

    return response.data;
  } catch (error) {
    console.error('Exception:', error);
    throw error;
  }
};

export const remitterBillersLookUp = async (apiData: string): Promise<MerchantApiResponse> => {
  try {
    // const apiToken = process.env.MIDDLEWARE_TOKEN;
    const axiosInstance = setupAxiosInterceptors();
    const url = `${process.env.SANDBOX_BASE_URL}/remita/billers/7`;

    console.log(`Sending request to ${url} with data`);

    const response: AxiosResponse<MerchantApiResponse> = await axiosInstance.get(url);
    console.log(`Response from ${url}: ${JSON.stringify(response.data)}`);

    return response.data;
 
  } catch (error) {
    console.error('Exception:', error);
    throw error;
  }
};

export const remitterBillerProductLookUp = async (apiData: string): Promise<MerchantApiResponse> => {
  try {
    // const apiToken = process.env.MIDDLEWARE_TOKEN;
    const axiosInstance = setupAxiosInterceptors();
    const url = `${process.env.SANDBOX_BASE_URL}/remita/products/S0000572202`;

    console.log(`Sending request to ${url} with data`);

    const response: AxiosResponse<MerchantApiResponse> = await axiosInstance.get(url);
    console.log(`Response from ${url}: ${JSON.stringify(response.data)}`);

    return response.data;
 
  } catch (error) {
    console.error('Exception:', error);
    throw error;
  }
};

export const remitterPayment = async (apiData: Record<string, string | number>): Promise<any> => {
  try {
    // const apiToken = process.env.MIDDLEWARE_TOKEN;
    const axiosInstance = setupAxiosInterceptors();
    const url = `${process.env.REMITTER_BASE_URL}/remita/init-pay-bill`;
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    };

    console.log(`Sending request to ${url} with data: ${JSON.stringify(apiData)}`);

    const response: AxiosResponse<any> = await axiosInstance.post(url, apiData, config);
    console.log(`Response from ${url}: ${JSON.stringify(response.data)}`);

    return response.data;
  } catch (error) {
    console.error('Exception:', error);
    throw error;
  }
};

async function doIswNetworkCurl(method: string, endpoint: string, payload: any): Promise<any> {
  const axiosInstance = setupAxiosInterceptors();
  const config: AxiosRequestConfig = {
    method,
    url: endpoint,
    data: payload,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  };

  try {
    const token = await getAuthToken();
    config.headers.Authorization = `Bearer ${token}`; // Adding Authorization header

    // Make the HTTP request using Axios
    const response: AxiosResponse<any> = await axiosInstance.request(config);

    const responseData = response.data;
    const statusCode = response.status;

    if (statusCode < 200 || statusCode > 299) {
      console.log(`RESPONSE: ${responseData} | CODE: ${statusCode}`);
      throw new Error('NOT-OK');
    }

    return responseData;
  } catch (error) {
    console.error('Error in HTTP request:', error.message);
    throw error;
  }
}

async function getAuthToken(): Promise<string> {
  const axiosInstance = setupAxiosInterceptors();
  // Check cached token if expired
  const lastAuth = localCache['lastAuthResponse'];
  const tokenExpires = localCache['iswTokenExpiresAt'];
  if (lastAuth && tokenExpires) {
    const auth: IswGenerateAuthTokenResponse = lastAuth;
    const tokenExpiresAt: Date = tokenExpires;
    if (auth.expiresIn > 0 && new Date() < tokenExpiresAt) {
      return auth.accessToken;
    }
  }

  // Replace these with your actual client ID and client secret
  const clientID = process.env.CLIENT_ID;
  const clientSecret = 'secret'; // Your client secret

  // API endpoint
  const endpoint = `${process.env.INTERSWITCH_BASE_URL}/passport/oauth/token`;

  // Set up the request data
  const data = new URLSearchParams();
  data.append('grant_type', 'client_credentials');

  // Create a request with HTTP Basic Authentication
  const authHeader = `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString('base64')}`;

  // Make the HTTP request
  try {
    const response: AxiosResponse<IswGenerateAuthTokenResponse> = await axiosInstance.post(endpoint, data.toString(), {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const iswResp: IswGenerateAuthTokenResponse = response.data;
    localCache['lastAuthResponse'] = iswResp;
    localCache['iswTokenExpiresAt'] = new Date(Date.now() + (iswResp.expiresIn - 60) * 1000);
    return iswResp.accessToken;
  } catch (error) {
    // Handle error
    console.error('Error fetching auth token:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}


export function setupAxiosInterceptors(): AxiosInstance {
  const axiosInstance = axios.create();

  axiosInstance.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 404) {
          throw new HttpException((data as any)?.message || 'Resource not found', HttpStatus.NOT_FOUND);
        } else if (status === 400) {
          throw new HttpException((data as any)?.message || 'Bad request', HttpStatus.BAD_REQUEST);
        } else {
          throw new HttpException((data as any)?.message || 'Failed to process payment transaction', status);
        }
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  );

  return axiosInstance;
}



