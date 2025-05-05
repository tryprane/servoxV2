import axios from 'axios';
import crypto from 'crypto';
import {logger } from '../utils/logger';
import dotenv from 'dotenv';
import path from 'path';

export interface CryptoPayment {
    amount: number;
    currency: string;
    order_id: string;
    url_callback: string;
    url_success: string;
    url_failed: string;
}


export class CryptoClient {
    private apiKey: string;
    private merchantId: string;

    constructor() {
        this.apiKey = process.env.CRYPTOMUS_API_KEY || '';
        this.merchantId = process.env.CRYPTOMUS_MERCHANT_ID || '';

        if(!this.apiKey || !this.merchantId) {
            logger.error(
                'Cryptomus api or merchant is not set on the environment variable'
            )
        }
    }


    async createPayment(params: CryptoPayment){
        try {
            const payload = {
                ...params,
                amount: typeof params.amount === 'number' ? params.amount.toString() : params.amount
            }

            const jsonPayload = JSON.stringify(payload);

            const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

            const sign = crypto
                .createHash('md5')
                .update(base64Payload + this.apiKey)
                .digest('hex');

                const response = await axios.post(
                    'https://api.cryptomus.com/v1/payment',
                    payload,
                    {
                        headers: {
                            'merchant': this.merchantId,
                            'sign': sign,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                return response.data;





        } catch (error) {
            logger.error("Cryptomus Payment creation error: " , error);
            throw error
        }
    }


    verifyWebhook(payload: any) : boolean {
        const payloadSignature = payload.sign || '';
        const signature = payloadSignature;

        if(!signature){
            logger.warn('No Signature Found in the payload or headers');
            return false;
        }

        const payloadWithoutSign = {...payload};
        delete payloadWithoutSign.sign;

        const jsonBody = JSON.stringify(payloadWithoutSign);

        const base64Body = Buffer.from(jsonBody).toString('base64');

        const calculatedSign = crypto
             .createHash('md5')
             .update(base64Body + this.apiKey)
             .digest('hex');

        const isValid = calculatedSign === signature;
        
        if(!isValid){
            logger.warn('Signature verification is Failed')
        }

        return isValid;


    }
}